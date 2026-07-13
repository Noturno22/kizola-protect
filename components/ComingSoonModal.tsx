import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { Check, X, Loader2, AlertCircle, Heart, Zap, Shield, Sparkles } from 'lucide-react-native';

type ComingSoonModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: 'apple' | 'phone' | 'default';
  accentColor?: string;
};

export function ComingSoonModal({
  visible,
  onClose,
  title,
  message,
  icon = 'default',
  accentColor,
}: ComingSoonModalProps) {
  const { theme, isDark } = useTheme();
  const accent = accentColor || theme.accent;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(onClose);
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim, onClose]);

  if (!visible) return null;

  const iconComponents = {
    apple: (
      <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
        <Sparkles size={36} color={accent} />
      </View>
    ),
    phone: (
      <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
        <Zap size={36} color={accent} />
      </View>
    ),
    default: (
      <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
        <AlertCircle size={36} color={accent} />
      </View>
    ),
  };

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFill,
        opacity: fadeAnim,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Fechar"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >
          <View style={[styles.modalContainer, { borderColor: accent + '40' }]}>
            {/* Top accent bar */}
            <View style={[styles.accentBar, { backgroundColor: accent }]} />

            {/* Icon */}
            <View style={styles.iconWrapper}>
              {iconComponents[icon]}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

            {/* Message */}
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

            {/* Feature cards */}
            <View style={styles.featuresContainer}>
              <View style={[styles.featureCard, { borderColor: accent + '30' }]}>
                <View style={[styles.featureIcon, { backgroundColor: accent + '15' }]}>
                  <Shield size={20} color={accent} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Seguro</Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Autenticação protegida</Text>
              </View>
              <View style={[styles.featureCard, { borderColor: accent + '30' }]}>
                <View style={[styles.featureIcon, { backgroundColor: accent + '15' }]}>
                  <Heart size={20} color={accent} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Privado</Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Seus dados protegidos</Text>
              </View>
              <View style={[styles.featureCard, { borderColor: accent + '30' }]}>
                <View style={[styles.featureIcon, { backgroundColor: accent + '15' }]}>
                  <Sparkles size={20} color={accent} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Em Breve</Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Novidades chegando</Text>
              </View>
            </View>

            {/* Close button */}
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: accent },
              ]}
              onPress={onClose}
              android_ripple={{ color: accent + '40' }}
            >
              <Text style={styles.closeButtonText}>Entendi, Continuar</Text>
            </Pressable>

            {/* Version hint */}
            <View style={styles.versionHint}>
              <Text style={[styles.versionText, { color: theme.textMuted }]}>
                Kizola Protect v2.0.0 • Em desenvolvimento
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1000,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 24,
  },
  accentBar: {
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginTop: -28,
    marginBottom: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  featureDesc: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 15,
  },
  closeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  versionHint: {
    paddingBottom: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default ComingSoonModal;