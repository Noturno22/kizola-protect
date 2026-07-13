/**
 * ═══════════════════════════════════════════════════════════════
 * 📱 Kizola Protect — Expo Dynamic Config
 * ═══════════════════════════════════════════════════════════════
 *
 * Single source of truth for all Expo configuration.
 * Environment-aware plugins (TLS pinning in production).
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

const isProduction = process.env.APP_ENV === 'production';

// ── Base plugins ─────────────────────────────────────────────
const plugins = [
  [
    'expo-router',
    {
      origin: 'https://kizola.app',
    },
  ],
  [
    'expo-splash-screen',
    {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
  ],
  [
    'expo-font',
    {
      fonts: [
        'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
      ],
    },
  ],
  'expo-web-browser',
  'expo-secure-store',
  'expo-localization',
  'expo-notifications',
];

// ── TLS Pinning — only in production ──────────────────────────
if (isProduction) {
  plugins.push([
    '@bam.tech/react-native-app-security',
    {
      sslPinning: {
        'api.kizola.app': [
          // ⚠️  REPLACE WITH REAL SHA-256 HASHES BEFORE BUILDING FOR PRODUCTION
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
    name: 'Kizola Protect',
    slug: 'kizola-protect',
    owner: 'samaina',
    scheme: 'kizola',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    plugins,
    experiments: {
      typedRoutes: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'app.luar.6xeu64ff9auaiakubrvpo',
      associatedDomains: ['applinks:kizola.app', 'applinks:www.kizola.app'],
      config: {
        usesNonExemptEncryption: false,
      },
      entitlements: {
        'com.apple.developer.applesignin': ['Default'],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'Kizola Protect needs camera access to scan and upload documents.',
        NSPhotoLibraryUsageDescription:
          'Kizola Protect needs photo library access to upload documents.',
        NSMicrophoneUsageDescription:
          'Kizola Protect needs microphone access for voice messages.',
        NSFaceIDUsageDescription:
          'Kizola Protect uses Face ID for secure authentication.',
      },
    },
    android: {
      softwareKeyboardLayoutMode: 'pan',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.kizolaprotect.app',
      intentFilters: [
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'https',
              host: 'kizola.app',
              pathPrefix: '/reset-password',
            },
            {
              scheme: 'https',
              host: 'www.kizola.app',
              pathPrefix: '/reset-password',
            },
            {
              scheme: 'kizola',
              host: '*',
              pathPrefix: '/reset-password',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'https',
              host: 'kizola.app',
              pathPrefix: '/',
            },
            {
              scheme: 'https',
              host: 'www.kizola.app',
              pathPrefix: '/',
            },
            {
              scheme: 'kizola',
              host: '*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/images/favicon.png',
    },
    extra: {
      router: {
        origin: 'https://kizola.app',
      },
      eas: {
        projectId: '347949bd-b8ba-474c-847a-5b6972a40f38',
      },
    },
  },
};
