import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicy() {
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
        <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>Last Updated: January 1, 2026</Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Kizola Protect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information We Collect</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We collect information that you provide directly to us, including:
          {'\n'}• Name, email address, and phone number
          {'\n'}• Account credentials
          {'\n'}• Profile information and preferences
          {'\n'}• Documents and files you upload
          {'\n'}• Communications with our support team
          {'\n'}• Payment information (processed securely through third-party providers)
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We use the collected information to:
          {'\n'}• Provide, maintain, and improve our services
          {'\n'}• Process your subscription and payments
          {'\n'}• Send you technical notices, updates, and support messages
          {'\n'}• Respond to your comments, questions, and requests
          {'\n'}• Monitor and analyze trends, usage, and activities
          {'\n'}• Detect, investigate, and prevent fraudulent transactions and abuse
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Information Sharing</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We do not sell your personal information. We may share your information with:
          {'\n'}• Service providers who perform services on our behalf
          {'\n'}• Legal authorities when required by law or to protect our rights
          {'\n'}• Business partners with your consent
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Your California Privacy Rights (CCPA)</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          If you are a California resident, you have the right to:
          {'\n'}• Know what personal information we collect and how it is used
          {'\n'}• Request deletion of your personal information
          {'\n'}• Opt out of the sale of your personal information
          {'\n'}• Non-discrimination for exercising your CCPA rights
          {'\n'}{'\n'}
          To exercise your CCPA rights, please use the "Delete Account" option in your profile settings or contact us at privacy@kizola.app.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Your GDPR Rights</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          If you are a resident of the European Economic Area (EEA), you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal data.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Data Security</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission or storage system is 100% secure.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Data Retention</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Contact Us</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          If you have questions about this Privacy Policy, please contact us at:
          {'\n'}Email: privacy@kizola.app
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
