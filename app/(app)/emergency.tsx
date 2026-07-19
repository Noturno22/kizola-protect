import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Phone, ArrowLeft, Clock, Globe, Scale, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { EMERGENCY_CONTACTS, EmergencyContact } from '@/lib/emergencyContacts';

const CATEGORY_ICONS: Record<string, typeof Phone> = {
  emergency: Phone,
  immigration: Globe,
  legal: Scale,
  safety: Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  emergency: '#EF4444',
  immigration: '#10B981',
  legal: '#3B82F6',
  safety: '#F59E0B',
};

export default function EmergencyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const categories = useMemo(() => {
    const grouped: Record<string, EmergencyContact[]> = {};
    EMERGENCY_CONTACTS.forEach((c) => {
      if (!grouped[c.category]) grouped[c.category] = [];
      grouped[c.category].push(c);
    });
    return grouped;
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(categories).map(([category, contacts]) => {
          const IconComponent = CATEGORY_ICONS[category] || Phone;
          const color = CATEGORY_COLORS[category] || '#6B7280';

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <IconComponent size={20} color={color} />
                <Text style={[styles.categoryTitle, { color }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>

              {contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => handleCall(contact.phone)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    {contact.description && (
                      <Text style={styles.contactDescription}>{contact.description}</Text>
                    )}
                    {contact.available24h && (
                      <View style={styles.badge24h}>
                        <Clock size={12} color="#FFFFFF" />
                        <Text style={styles.badge24hText}>24/7</Text>
                      </View>
                    )}
                  </View>
                  <Phone size={20} color={color} />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: { marginRight: 12 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    content: { flex: 1, padding: 16 },
    categorySection: { marginBottom: 24 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    categoryTitle: { fontSize: 16, fontWeight: '700' },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    contactInfo: { flex: 1, marginRight: 12 },
    contactName: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
    contactPhone: { fontSize: 14, color: theme.accent, fontWeight: '500', marginBottom: 4 },
    contactDescription: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
    badge24h: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
      gap: 4,
    },
    badge24hText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  });
}
