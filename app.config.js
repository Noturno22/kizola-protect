/**
 * ═══════════════════════════════════════════════════════════════
 * 📱 Kizola Protect — Expo Dynamic Config
 * ═══════════════════════════════════════════════════════════════
 *
 * This config extends app.json with environment-aware plugins.
 * app.config.js takes precedence over app.json at build time.
 *
 * TLS PINNING (OWASP M3 Compliance):
 *   Enabled ONLY in production builds via @bam.tech/react-native-app-security.
 *   Uses TrustKit (iOS) + OkHttp CertificatePinner (Android).
 *
 *   To configure with real hashes:
 *     1. Deploy backend to https://api.kizola.app
 *     2. Generate SHA-256 SPKI hashes:
 *        openssl s_client -servername api.kizola.app -connect api.kizola.app:443 -showcerts \
 *          | openssl x509 -pubkey -noout \
 *          | openssl pkey -pubin -outform der \
 *          | openssl dgst -sha256 -binary \
 *          | openssl enc -base64
 *     3. Replace the placeholder hashes below
 *     4. Build with APP_ENV=production
 * ═══════════════════════════════════════════════════════════════
 */

const baseConfig = require('./app.json');

const isProduction = process.env.APP_ENV === 'production';

// Start with all plugins from app.json (expo-network-addons was removed)
const plugins = [...(baseConfig.expo.plugins || [])];

// ── TLS Pinning — only in production ──────────────────────────
if (isProduction) {
  plugins.push([
    '@bam.tech/react-native-app-security',
    {
      sslPinning: {
        'api.kizola.app': [
          // ⚠️  REPLACE WITH REAL SHA-256 HASHS BEFORE BUILDING FOR PRODUCTION
          //     Generate with the openssl command above.
          //     Always include 2 pins (primary + backup) for cert rotation safety.
          //
          // Status: api.kizola.app is NOT YET DEPLOYED (Jul 2026).
          //   Placeholders remain until deployment. Generate hashes before
          //   the first production build.
          'sha256/REPLACE_WITH_PRIMARY_HASH',
          'sha256/REPLACE_WITH_BACKUP_HASH',
        ],
      },
    },
  ]);
}

module.exports = {
  expo: {
    ...baseConfig.expo,
    plugins,
  },
};
