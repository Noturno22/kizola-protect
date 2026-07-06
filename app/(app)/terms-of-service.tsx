import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfService() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>Last Updated: January 1, 2026</Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Welcome to Kizola Protect. By using our application and services, you agree to these Terms of Service. Please read them carefully.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          By accessing or using Kizola Protect, you agree to be bound by these Terms. If you do not agree, do not use the service.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Eligibility</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          You must be at least 18 years old to use this service. By creating an account, you represent that you meet this requirement and that all information you provide is accurate and complete.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Account Responsibilities</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Subscription and Payments</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Subscription fees are billed in advance on a monthly basis. Cancellation takes effect at the end of the current billing period. We use Apple In-App Purchase and Google Play Billing for payment processing — your payment information is handled by the respective platform, not by Kizola Protect directly.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Service Description</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Kizola Protect provides information, resources, and guidance for immigrants and underserved communities. Our services include educational content, community support, and referrals to professional services. We do not provide legal advice, tax advice, or direct legal representation unless explicitly stated.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Limitation of Liability</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          To the maximum extent permitted by law, Kizola Protect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Termination</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We may terminate or suspend your account at any time for violation of these Terms. You may cancel your account at any time through your profile settings.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Governing Law</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          These Terms shall be governed by the laws of the State of [State], United States, without regard to its conflict of law provisions.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Changes to Terms</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We reserve the right to modify these Terms at any time. We will notify users of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>10. Contact</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          For questions about these Terms, contact us at:
          {'\n'}Email: legal@kizola.app
          {'\n'}[Address placeholder — Kizola Protect Legal Department]
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  lastUpdated: { fontSize: 13, marginBottom: 20, fontStyle: 'italic' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
});
