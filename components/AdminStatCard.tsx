import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendValue?: string;
  color?: string;
  delay?: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export function AdminStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color, 
  delay = 0 
}: AdminStatCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
          borderColor: theme.cardBorder,
        }
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color || theme.accent + '20' }]}>
          <Icon size={20} color={color || theme.accent} />
        </View>
        {trendValue && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: trend === 'up' ? theme.success : theme.error }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    marginTop: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});
