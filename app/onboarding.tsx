import { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  ChevronRight,
  Bell,
  Users,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { APP_ONBOARDING_COMPLETED_KEY } from './index';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  titleKey: string;
  descKey: string;
  image: any;
  icon: any;
  color: string;
  bg: string;
  floatingIcons: any[];
  overlayTitle?: string;
  overlaySubtitle?: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      titleKey: 'dashboard.welcomeToDashboard',
      descKey: 'dashboard.onboardingSubtitle',
      image: require('@/assets/onboarding/family.png'),
      icon: Shield,
      color: theme.accent,
      bg: theme.accent + '20',
      floatingIcons: [Shield, Bell, Users],
      overlayTitle: 'Tudo protegido',
      overlaySubtitle: 'Segurança familiar ativa',
    },
    {
      id: '2',
      titleKey: 'profile.benefits',
      descKey: 'dashboard.accessServices',
      image: require('@/assets/onboarding/dashboard.png'),
      icon: Zap,
      color: theme.accentBlue,
      bg: theme.accentBlue + '20',
      floatingIcons: [Activity, Smartphone, Lock],
      overlayTitle: 'Monitoramento real',
      overlaySubtitle: 'Status em tempo real',
    },
    {
      id: '3',
      titleKey: 'support.title',
      descKey: 'dashboard.getHelpNow',
      image: require('@/assets/onboarding/benefits.png'),
      icon: CheckCircle2,
      color: theme.accentPurple,
      bg: theme.accentPurple + '20',
      floatingIcons: [Zap, Bell, Shield],
      overlayTitle: 'Benefícios Premium',
      overlaySubtitle: 'Acesso total liberado',
    },
    {
      id: '4',
      titleKey: 'dashboard.myPlan',
      descKey: 'dashboard.manageSubscription',
      image: require('@/assets/onboarding/support.png'),
      icon: AlertCircle,
      color: theme.accentAmber,
      bg: theme.accentAmber + '20',
      floatingIcons: [Users, Shield, Activity],
      overlayTitle: 'Suporte 24/7',
      overlaySubtitle: 'Sempre disponível',
    },
  ];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(APP_ONBOARDING_COMPLETED_KEY, 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/login');
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isActive = currentIndex === index;

    return (
      <View style={styles.slide}>
        {/* Hero Area */}
        <View style={styles.heroArea}>
          {/* Background Glow */}
          <MotiView
            from={{ opacity: 0.3, scale: 0.8 }}
            animate={{ 
              opacity: isActive ? 0.6 : 0.3, 
              scale: isActive ? 1.1 : 0.9 
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
            style={[styles.glowCircle, { backgroundColor: item.color + '40' }]}
          />

          {/* Background Shield */}
          <View style={styles.shieldBackground}>
            <Shield size={height * 0.3} color={theme.accent + '10'} strokeWidth={0.5} />
          </View>

          {/* Floating Icons */}
          {item.floatingIcons.map((IconComp, i) => (
            <MotiView
              key={i}
              from={{ translateY: 0, opacity: 0 }}
              animate={{ 
                translateY: isActive ? [0, -15, 0] : 0,
                opacity: isActive ? 0.8 : 0
              }}
              transition={{
                type: 'timing',
                duration: 2000 + i * 500,
                loop: true,
                delay: i * 200,
              }}
              style={[
                styles.floatingIcon,
                i === 0 && { top: '15%', left: '15%' },
                i === 1 && { top: '10%', right: '20%' },
                i === 2 && { bottom: '25%', right: '10%' },
              ]}
            >
              <IconComp size={28} color={item.color} />
            </MotiView>
          ))}

          {/* Main Image */}
          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 20 }}
            animate={{ 
              opacity: isActive ? 1 : 0, 
              scale: isActive ? 1 : 0.9,
              translateY: isActive ? 0 : 20
            }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.imageContainer}
          >
            <Image 
              source={item.image} 
              style={styles.heroImage} 
              resizeMode="contain" 
            />
          </MotiView>

          {/* Glassmorphism Cards */}
          <AnimatePresence>
            {isActive && (
              <MotiView
                from={{ opacity: 0, scale: 0.8, translateX: -20 }}
                animate={{ opacity: 1, scale: 1, translateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, translateX: -20 }}
                transition={{ type: 'timing', duration: 600, delay: 400 }}
                style={styles.blurCardContainer}
              >
                <BlurView intensity={30} tint="dark" style={styles.blurCard}>
                  <View style={[styles.cardDot, { backgroundColor: item.color }]} />
                  <View>
                    <Text style={styles.cardTitle}>{item.overlayTitle}</Text>
                    <Text style={styles.cardSubtitle}>{item.overlaySubtitle}</Text>
                  </View>
                </BlurView>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* Text Area */}
        <View style={styles.textContainer}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ 
              opacity: isActive ? 1 : 0, 
              translateY: isActive ? 0 : 20 
            }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {t(item.titleKey) || item.titleKey}
            </Text>
            {isActive && (
              <MotiView
                from={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ type: 'timing', duration: 800, delay: 400 }}
                style={[styles.titleUnderline, { backgroundColor: item.color }]}
              />
            )}
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ 
              opacity: isActive ? 1 : 0, 
              translateY: isActive ? 0 : 20 
            }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
          >
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {t(item.descKey) || item.descKey}
            </Text>
          </MotiView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#031126', '#000814']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background Particles/Glows */}
      <View style={[styles.bgGlow, { top: '10%', left: '-20%', backgroundColor: theme.accent + '15' }]} />
      <View style={[styles.bgGlow, { bottom: '20%', right: '-30%', backgroundColor: theme.accentBlue + '10' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.logoContainer}
          >
            <Shield size={24} color={theme.accent} />
            <Text style={[styles.logoText, { color: theme.text }]}>KIZOLA</Text>
            <Text style={[styles.logoTextBold, { color: theme.accent }]}>PROTECT</Text>
          </MotiView>
          
          <TouchableOpacity onPress={completeOnboarding} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>
              {t('common.cancel') || 'Pular'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          decelerationRate="fast"
          snapToInterval={width}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => {
              const active = currentIndex === index;
              return (
                <MotiView
                  key={index}
                  animate={{ 
                    width: active ? 28 : 8,
                    opacity: active ? 1 : 0.3,
                    backgroundColor: active ? theme.accent : theme.textMuted
                  }}
                  transition={{ type: 'timing', duration: 300 }}
                  style={styles.dot}
                />
              );
            })}
          </View>

          <MotiView
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.9}
              style={styles.touchable}
            >
              <LinearGradient
                colors={[theme.accent, '#00A896']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentIndex === slides.length - 1 
                    ? (t('dashboard.getStarted') || 'Começar Agora') 
                    : (t('common.done') || 'Próximo')}
                </Text>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
            {/* Button Glow */}
            <View style={[styles.buttonGlow, { shadowColor: theme.accent }]} />
          </MotiView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safeArea: {
    flex: 1,
  },
  bgGlow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 1.5,
  },
  logoTextBold: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
  },
  heroArea: {
    width: '100%',
    height: height * 0.48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    zIndex: 1,
  },
  shieldBackground: {
    position: 'absolute',
    opacity: 0.4,
    zIndex: 0,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 5,
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageContainer: {
    width: '85%',
    height: '80%',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  blurCardContainer: {
    position: 'absolute',
    bottom: '15%',
    left: '10%',
    zIndex: 10,
    width: '60%',
  },
  blurCard: {
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,200,180,0.3)',
    overflow: 'hidden',
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'left',
    lineHeight: 42,
    marginBottom: 8,
    letterSpacing: -1,
  },
  titleUnderline: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  description: {
    fontSize: 17,
    textAlign: 'left',
    lineHeight: 26,
    opacity: 0.8,
    paddingRight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 30,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
    position: 'relative',
  },
  touchable: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonGlow: {
    position: 'absolute',
    top: 5,
    left: 10,
    right: 10,
    bottom: 0,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    zIndex: 1,
  },
});

