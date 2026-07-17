import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Moon, Sun, FileText, Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';

type Tab = 'terms' | 'privacy';

export default function TermsAndPrivacy() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('terms');

  const renderContent = () => {
    if (activeTab === 'terms') {
      return (
        <>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{t('terms.title')}</Text>
            <Text style={[styles.effectiveDate, { color: theme.textSecondary }]}>{t('terms.lastUpdated')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.welcome')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section1Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section1Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section2Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section2Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section3Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section3Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section4Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section4Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section5Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section5Intro')}
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • {t('terms.section5Bullet1')}{'\n'}
              • {t('terms.section5Bullet2')}{'\n'}
              • {t('terms.section5Bullet3')}{'\n'}
              • {t('terms.section5Bullet4')}{'\n'}
              • {t('terms.section5Bullet5')}{'\n'}
              • {t('terms.section5Bullet6')}{'\n'}
              • {t('terms.section5Bullet7')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section6Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section6Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section7Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section7Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section8Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section8Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section9Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section9Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section10Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section10Body')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('terms.section11Title')}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section11Intro')}
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {t('terms.section11Email')}{'\n'}
              {t('terms.section11Address')}{'\n'}
              {t('terms.section11Phone')}
            </Text>
          </View>
        </>
      );
    }

    return (
      <>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t('privacy.title')}</Text>
          <Text style={[styles.effectiveDate, { color: theme.textSecondary }]}>{t('privacy.lastUpdated')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.welcome')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section1Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section1Intro')}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            • {t('privacy.section1Bullet1')}{'\n'}
            • {t('privacy.section1Bullet2')}{'\n'}
            • {t('privacy.section1Bullet3')}{'\n'}
            • {t('privacy.section1Bullet4')}{'\n'}
            • {t('privacy.section1Bullet5')}{'\n'}
            • {t('privacy.section1Bullet6')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section2Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section2Intro')}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            • {t('privacy.section2Bullet1')}{'\n'}
            • {t('privacy.section2Bullet2')}{'\n'}
            • {t('privacy.section2Bullet3')}{'\n'}
            • {t('privacy.section2Bullet4')}{'\n'}
            • {t('privacy.section2Bullet5')}{'\n'}
            • {t('privacy.section2Bullet6')}{'\n'}
            • {t('privacy.section2Bullet7')}{'\n'}
            • {t('privacy.section2Bullet8')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section3Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section3Intro')}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            • {t('privacy.section3Bullet1')}{'\n'}
            • {t('privacy.section3Bullet2')}{'\n'}
            • {t('privacy.section3Bullet3')}{'\n'}
            • {t('privacy.section3Bullet4')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section4Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section4Body')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section5Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section5Intro')}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            • {t('privacy.section5Bullet1')}{'\n'}
            • {t('privacy.section5Bullet2')}{'\n'}
            • {t('privacy.section5Bullet3')}{'\n'}
            • {t('privacy.section5Bullet4')}{'\n'}
            • {t('privacy.section5Bullet5')}{'\n'}
            • {t('privacy.section5Bullet6')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section6Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section6Body')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section7Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section7Body')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section8Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section8Body')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section9Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section9Body')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">{t('privacy.section10Title')}</Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section10Intro')}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {t('privacy.section10Email')}{'\n'}
            {t('privacy.section10Address')}{'\n'}
            {t('privacy.section10Phone')}
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#060D1F' : '#EEF2FF' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Back Button ────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, shadowColor: '#000' }]}
        accessibilityLabel={t('common.back') || 'Back'}
        accessibilityRole="button"
      >
        <ArrowLeft size={20} color={theme.text} />
      </TouchableOpacity>

      {/* ── Theme Toggle ───────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, shadowColor: '#000' }]}
        activeOpacity={0.8}
        accessibilityLabel={isDark ? (t('common.light') || 'Light') : (t('common.dark') || 'Dark')}
        accessibilityRole="button"
      >
        <View style={[styles.themeToggleTrack, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
          <View
            style={[styles.themeToggleThumb, { backgroundColor: isDark ? '#3B82F6' : '#2563EB', transform: [{ translateX: isDark ? 22 : 2 }] }]}
          >
            {isDark ? <Moon size={12} color="#FFFFFF" /> : <Sun size={12} color="#FFFFFF" />}
          </View>
        </View>
        <Text style={[styles.themeToggleLabel, { color: theme.textSecondary }]}>
          {isDark ? (t('common.dark') || 'Dark') : (t('common.light') || 'Light')}
        </Text>
      </TouchableOpacity>

      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={isDark ? ['#060D1F', '#0A1628', '#0D1F3C'] : ['#EEF2FF', '#F0F9FF', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />

        {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
        <View style={[styles.tabBar, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'terms' && [styles.activeTab, { backgroundColor: theme.primary + '20' }]]}
            onPress={() => setActiveTab('terms')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'terms' }}
          >
            <FileText size={16} color={activeTab === 'terms' ? theme.primary : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'terms' ? theme.primary : theme.textSecondary }]}>
              {t('terms.title') || 'Terms of Service'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'privacy' && [styles.activeTab, { backgroundColor: theme.primary + '20' }]]}
            onPress={() => setActiveTab('privacy')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'privacy' }}
          >
            <Shield size={16} color={activeTab === 'privacy' ? theme.primary : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'privacy' ? theme.primary : theme.textSecondary }]}>
              {t('privacy.title') || 'Privacy Policy'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // ── Back Button ───────────────────────────────────────────────────────────
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Theme Toggle ──────────────────────────────────────────────────────────
  themeToggle: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  themeToggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  themeToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleLabel: { fontSize: 13, fontWeight: '600' },

  // ── Tab Bar ────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginTop: 100,
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Content ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  effectiveDate: {
    fontSize: 13,
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
});
