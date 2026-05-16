import { Stack } from 'expo-router';

/**
 * Auth group layout.
 * Unauthenticated users land here (login + verify screens).
 * Uses a plain Stack with no visible header.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
