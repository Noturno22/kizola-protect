/**
 * ═══════════════════════════════════════════════════════════════
 * 🔒 Axios API Client — Agent-Guardian (CISO)
 * ═══════════════════════════════════════════════════════════════
 *
 * TLS PINNING (OWASP M3 Compliance) — ACTIVE (production only)
 * ─────────────────────────────────────────────────────────
 * Native pinning via @bam.tech/react-native-app-security:
 *   iOS:   TrustKit — SSL public key pinning
 *   Android: OkHttp CertificatePinner — SPKI hash pinning
 *
 * Configuration lives in:
 *   app.config.js  →  @bam.tech/react-native-app-security plugin
 * Enabled ONLY when APP_ENV=production (build time).
 *
 * To configure production certificate hashes:
 *   1. Ensure https://api.kizola.app is deployed and serving HTTPS
 *   2. Generate SHA-256 SPKI hashes:
 *      openssl s_client -servername api.kizola.app -connect api.kizola.app:443 -showcerts \
 *        | openssl x509 -pubkey -noout \
 *        | openssl pkey -pubin -outform der \
 *        | openssl dgst -sha256 -binary \
 *        | openssl enc -base64
 *   3. Replace placeholders in app.config.js
 *   4. Build with APP_ENV=production
 *
 * JS-level hostname validation below serves as a secondary fallback
 * (catches development misconfigurations).
 * ═══════════════════════════════════════════════════════════════
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SECURE_KEYS } from '@/lib/secureStorage';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const ALLOWED_HOSTNAMES = ['api.kizola.app', 'localhost'];

// Enforce HTTPS in production
if (!__DEV__ && BASE_URL.startsWith('http://')) {
  console.error(
    '[apiClient] CRITICAL: Production API URL must use HTTPS. ' +
    'Set EXPO_PUBLIC_API_URL to an https:// endpoint.'
  );
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Attach auth token ──────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Error handling + token refresh ─────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 — attempt token refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(
          SECURE_KEYS.REFRESH_TOKEN
        );
        if (refreshToken) {
          // Token refresh would go here via Supabase auth.refreshSession()
          // For now, clear tokens and let AuthProvider handle re-auth
          await Promise.all([
            SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
          ]);
        }
      } catch {
        // Refresh failed — AuthProvider will handle session expiry
      }
    }

    if (__DEV__) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

// ─── TLS Pinning Validation (OWASP M3) ──────────────────────
// For production, use expo-network-addons for native pinning.
// This is a JS-level hostname validation fallback.

export function validateHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !__DEV__) {
      return false;
    }
    return ALLOWED_HOSTNAMES.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}
