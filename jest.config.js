/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // NOTE: must match the preset pattern EXACTLY — no trailing [\/] after pkg names
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-web|@react-native-async-storage|react-i18next|i18next|@tanstack|moti|expo-router|expo-status-bar|expo-secure-store|expo-localization|expo-constants|expo-linking|expo-crypto|expo-haptics|expo-image|expo-image-picker|expo-file-system|expo-font|expo-notifications|expo-splash-screen|expo-system-ui|expo-web-browser|expo-blur|expo-device|expo-document-picker|expo-intent-launcher|expo-keep-awake|expo-linear-gradient|expo-location|expo-print|expo-sharing|expo-symbols|expo-apple-authentication|expo-auth-session|lucide-react-native|@nkzw|react-native-pdf|react-native-worklets|@bam\\.tech))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: [],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
};

module.exports = config;
