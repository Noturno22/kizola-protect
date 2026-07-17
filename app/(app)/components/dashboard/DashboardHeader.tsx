import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Bell,
  Sun,
  Moon,
  LayoutDashboard,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Props = {
  theme: any;
  styles: any;
  isDark: boolean;
  userName: string;
  greeting: string;
  adminRole: string | undefined;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
};

export function DashboardHeader({
  theme,
  styles,
  isDark,
  userName,
  greeting,
  adminRole,
  onToggleTheme,
  onOpenNotifications,
  unreadCount,
}: Props) {
  const router = useRouter();

  return (
    <LinearGradient colors={theme.headerGradient} style={styles.header}>
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: i * 24 }]} />
        ))}
      </View>
      <View style={styles.radialGlow} pointerEvents="none" />

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <View style={styles.headerActions}>
          {adminRole === 'admin' && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.accent + '25', borderColor: theme.accent + '40', padding: 8 }]}
              onPress={() => router.push('/(app)/admin/dashboard')}
              activeOpacity={0.7}
            >
              <View style={{ backgroundColor: theme.accent + '20', borderRadius: 8, padding: 6 }}>
                <LayoutDashboard size={22} color={theme.accent} strokeWidth={1.8} />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={onToggleTheme}>
            {isDark ? <Sun size={19} color={theme.text} /> : <Moon size={19} color={theme.text} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenNotifications}>
            <Bell size={20} color={theme.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/terms')}>
            <Shield size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

export default DashboardHeader;
