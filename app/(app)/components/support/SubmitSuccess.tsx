import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, Clock, Mail } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface SubmitSuccessProps {
  onReset: () => void;
  onViewActivity: () => void;
  theme: any;
  styles: any;
  fadeAnim: Animated.Value;
  email: string;
  t: (key: string, options?: any) => string;
}

export default function SubmitSuccess({
  onReset,
  onViewActivity,
  theme,
  styles,
  fadeAnim,
  email,
  t,
}: SubmitSuccessProps) {
  return (
    <>
      <LinearGradient
        colors={theme.headerGradient}
        style={{ flex: 1 }}
      />
      <View style={styles.successContainer}>
        <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
          <View style={styles.successIconWrapper}>
            <BlurView intensity={30} tint="light" style={{ flex: 1, borderRadius: 40 }} />
            <CheckCircle2 size={64} color={theme.isDark ? '#FFFFFF' : theme.accent} />
          </View>

          <Text style={[styles.successTitle, { color: theme.text }]}>
            {t('support.requestSubmitted')}
          </Text>
          <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
            {t('support.thankYou')}
          </Text>

          <BlurView intensity={20} tint="light" style={styles.successInfoCard}>
            <View style={styles.successInfoRow}>
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.successInfoText}>{t('support.responseTimeInfo')}</Text>
            </View>
            <View style={styles.successInfoDivider} />
            <View style={styles.successInfoRow}>
              <Mail size={20} color="#FFFFFF" />
              <Text style={styles.successInfoText}>
                {t('support.confirmationSent')} {email}
              </Text>
            </View>
          </BlurView>

          <View style={styles.successButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onReset}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{t('support.submitAnother')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onViewActivity}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>{t('support.viewActivity')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </>
  );
}
