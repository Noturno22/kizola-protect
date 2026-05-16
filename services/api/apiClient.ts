/**
 * Axios API client — points to the Kizola auth backend.
 *
 * Base URL: set EXPO_PUBLIC_API_URL in .env.local
 * Falls back to localhost:3000 for local development.
 */

import axios from 'axios';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Log errors in development only
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
