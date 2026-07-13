import { useState } from 'react';
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
import { ArrowLeft, Moon, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';

export default function TermsOfService() {
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Terms of Service</Text>
            <Text style={[styles.effectiveDate, { color: theme.textSecondary }]}>Last Updated: July 4, 2026</Text>
          </View>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Welcome to Kizola Protect. By using our mobile application and services, you agree to these Terms of Service. Please read them carefully.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">1. Acceptance of Terms</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              By creating an account, accessing, or using Kizola Protect ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We may update these terms at any time, and continued use constitutes acceptance of updated terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">2. Account Registration</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              You must be at least 18 years old to use this Service. You agree to provide accurate, current, and complete information during registration and to update such information as needed. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">3. Subscription and Billing</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Certain features require a paid subscription. Subscription fees are billed monthly in advance and are non-refundable except as expressly stated. We reserve the right to change our fees with 30 days notice. Cancellation takes effect at the end of the current billing period.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">4. Services Description</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Kizola Protect provides information, resources, and connections to professional services including legal guidance, immigration assistance, tax preparation support, housing resources, and educational content. We do not provide legal advice directly. Our platform connects you with third-party professionals who are independently responsible for the services they provide.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">5. User Conduct</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              You agree not to:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              • Use the Service for any unlawful purpose{'\n'}
              • Impersonate any person or entity{'\n'}
              • Interfere with or disrupt the Service{'\n'}
              • Attempt to gain unauthorized access to our systems{'\n'}
              • Upload malicious code or content{'\n'}
              • Abuse the support system or harass our team{'\n'}
              • Use the Service to violate any applicable laws or regulations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">6. Intellectual Property</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              The Service and its original content, features, and functionality are owned by Kizola Protect and are protected by international copyright, trademark, and other intellectual property laws. You may not modify, reproduce, distribute, or create derivative works without our express written consent.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">7. Limitation of Liability</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Kizola Protect shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">8. Third-Party Services</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Our platform may link to or integrate with third-party services. We are not responsible for the content, privacy practices, or actions of any third-party services. Your interactions with third-party providers are governed by their respective terms and policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">9. Termination</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or behavior that could harm other users or the Service. You may cancel your account at any time by contacting our support team.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">10. Governing Law</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of Miami-Dade County, Florida.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">11. Contact</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              For questions about these Terms, please contact us:
            </Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              Email: support@kizolaprotect.com{'\n'}
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
