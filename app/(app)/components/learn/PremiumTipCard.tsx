import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { Theme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';

interface PremiumTipCardProps {
  theme: Theme;
  t: (key: string) => string;
}

export function PremiumTipCard({ theme, t }: PremiumTipCardProps) {
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <View style={styles.tipSection}>
      <LinearGradient
        colors={theme.isDark ? [theme.accent, theme.primary] : [theme.accent, theme.accentBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumTipCard}
      >
        <View style={styles.tipIconGlow}>
          <Sparkles size={28} color={theme.accentAmber} />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.premiumTipTitle}>{t('learn.needHelp')}</Text>
          <Text style={styles.premiumTipDescription}>
            {t('learn.helpDesc')}
          </Text>
          <TouchableOpacity
            style={styles.premiumTipButton}
            onPress={() => router.push('/support')}
            activeOpacity={0.9}
          >
            <Text style={styles.premiumTipButtonText}>
              {t('learn.contactSupport')}
            </Text>
            <ChevronRight size={16} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tipSection: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    premiumTipCard: {
      flexDirection: 'row',
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    tipIconGlow: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    tipContent: {
      flex: 1,
    },
    premiumTipTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 6,
    },
    premiumTipDescription: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 20,
      marginBottom: 16,
    },
    premiumTipButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    premiumTipButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.accent,
    },
  });

export default PremiumTipCard;
