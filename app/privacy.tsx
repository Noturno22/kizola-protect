import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';

export default function PrivacyPolicy() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#060D1F', '#0A1628', '#0D1F3C'] : ['#EEF2FF', '#F0F9FF', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* ── Back Button ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, shadowColor: '#000' }]}
          accessibilityLabel={t('common.back') || 'Back'}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
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
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.themeToggleLabel, { color: theme.textSecondary }]}>
            {isDark ? (t('common.dark') || 'Dark') : (t('common.light') || 'Light')}
          </Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>
            <Text style={[styles.effectiveDate, { color: theme.textSecondary }]}>Last Updated: July 4, 2026</Text>
          </View>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Kizola Protect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">1. Information We Collect</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We collect information that you provide directly to us, including:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • Personal identification information (name, email address, phone number){'\n'}
              • Account credentials (password, authentication data){'\n'}
              • Profile information (avatar, preferences, language settings){'\n'}
              • Payment information (processed securely through third-party payment processors){'\n'}
              • Documents you upload for verification and support purposes{'\n'}
              • Communications you send to us (support requests, messages)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">2. How We Use Your Information</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We use the information we collect to:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • Create and maintain your account{'\n'}
              • Provide, operate, and improve our services{'\n'}
              • Process transactions and send related information{'\n'}
              • Send technical notices, updates, security alerts, and support messages{'\n'}
              • Respond to your comments, questions, and requests{'\n'}
              • Monitor and analyze usage trends and preferences{'\n'}
              • Detect, prevent, and address fraud, abuse, or security issues{'\n'}
              • Comply with legal obligations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">3. Information Sharing</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We do not sell your personal information. We may share your information with:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • Service providers who help us operate our platform (hosting, analytics, payment processing){'\n'}
              • Professional partners (attorneys, immigration specialists, tax advisors) when you request their services{'\n'}
              • Law enforcement or legal process when required by law{'\n'}
              • Third parties with your explicit consent
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">4. Data Security</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We implement industry-standard security measures including encryption at rest and in transit, secure storage of authentication tokens, and regular security audits. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">5. Your Rights</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Depending on your jurisdiction, you may have the right to:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • Access the personal information we hold about you{'\n'}
              • Request correction of inaccurate information{'\n'}
              • Request deletion of your information (see our CCPA compliance section){'\n'}
              • Opt out of certain data processing activities{'\n'}
              • Withdraw consent at any time{'\n'}
              • Receive a copy of your data in a portable format
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">6. CCPA Notice (California Residents)</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information. You have the right to request disclosure of our data collection practices, request deletion of your personal information, and opt out of the sale of your personal information. We do not sell your personal information. To exercise your rights, contact us at privacy@kizolaprotect.com or use the "Delete My Data" option in your profile settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">7. Data Retention</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">8. Children's Privacy</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">9. Changes to This Policy</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. You are advised to review this policy periodically for any changes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">10. Contact Us</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              If you have questions about this Privacy Policy, please contact us:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Email: privacy@kizolaprotect.com{'\n'}
              Address: 1401 Brickell Ave, Suite 600, Miami, FL 33131{'\n'}
              Phone: +1 (929) 609-7035
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },

  // ── Back Button ───────────────────────────────────────────────────────────
  backButton: {
    position: 'absolute',
    top: 16,
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
    top: 16,
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

  // ── Content ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
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
