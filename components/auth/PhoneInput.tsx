/**
 * PhoneInput — country code picker + phone number field.
 * Validates E.164 format in real time.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, X } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

// ── Country data ───────────────────────────────────────────────────────────

export interface Country {
  name: string;
  flag: string;
  code: string; // dial code, e.g. "+244"
  iso: string;  // ISO 3166-1 alpha-2
}

const COUNTRIES: Country[] = [
  { name: 'Angola',           flag: '🇦🇴', code: '+244', iso: 'AO' },
  { name: 'Portugal',         flag: '🇵🇹', code: '+351', iso: 'PT' },
  { name: 'Brazil',           flag: '🇧🇷', code: '+55',  iso: 'BR' },
  { name: 'United States',    flag: '🇺🇸', code: '+1',   iso: 'US' },
  { name: 'United Kingdom',   flag: '🇬🇧', code: '+44',  iso: 'GB' },
  { name: 'France',           flag: '🇫🇷', code: '+33',  iso: 'FR' },
  { name: 'Germany',          flag: '🇩🇪', code: '+49',  iso: 'DE' },
  { name: 'South Africa',     flag: '🇿🇦', code: '+27',  iso: 'ZA' },
  { name: 'Mozambique',       flag: '🇲🇿', code: '+258', iso: 'MZ' },
  { name: 'Cape Verde',       flag: '🇨🇻', code: '+238', iso: 'CV' },
  { name: 'São Tomé',         flag: '🇸🇹', code: '+239', iso: 'ST' },
  { name: 'Guinea-Bissau',    flag: '🇬🇼', code: '+245', iso: 'GW' },
  { name: 'Equatorial Guinea',flag: '🇬🇶', code: '+240', iso: 'GQ' },
  { name: 'Spain',            flag: '🇪🇸', code: '+34',  iso: 'ES' },
  { name: 'Netherlands',      flag: '🇳🇱', code: '+31',  iso: 'NL' },
  { name: 'Canada',           flag: '🇨🇦', code: '+1',   iso: 'CA' },
  { name: 'Italy',            flag: '🇮🇹', code: '+39',  iso: 'IT' },
];

// ── Component ──────────────────────────────────────────────────────────────

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, disabled }) => {
  const { theme } = useTheme();

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // default Angola
  const [localNumber, setLocalNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : COUNTRIES;

  const handleNumberChange = useCallback(
    (text: string) => {
      // Strip non-digits
      const digits = text.replace(/\D/g, '');
      setLocalNumber(digits);
      onChange(`${selectedCountry.code}${digits}`);
    },
    [selectedCountry, onChange]
  );

  const handleCountrySelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      onChange(`${country.code}${localNumber}`);
      setModalVisible(false);
      setSearch('');
    },
    [localNumber, onChange]
  );

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            borderColor: theme.cardBorderAlt,
          },
        ]}
      >
        {/* Country selector */}
        <TouchableOpacity
          style={styles.countryBtn}
          onPress={() => setModalVisible(true)}
          disabled={disabled}
          accessibilityLabel="Select country code"
          accessibilityHint="Double tap to select your country code"
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={[styles.code, { color: theme.text }]}>{selectedCountry.code}</Text>
          <ChevronDown size={14} color={theme.textMuted} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.cardBorderAlt }]} />

        {/* Phone number field */}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Phone number"
          placeholderTextColor={theme.textMuted}
          value={localNumber}
          onChangeText={handleNumberChange}
          keyboardType="phone-pad"
          editable={!disabled}
          maxLength={15}
          autoComplete="tel"
          textContentType="telephoneNumber"
          accessibilityLabel="Phone number"
        />
      </View>

      {/* Country picker modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView
            style={[styles.modalSheet, { backgroundColor: theme.surface }]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close country picker"
                accessibilityRole="button"
              >
                <X size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.background, borderColor: theme.cardBorderAlt },
              ]}
            >
              <Search size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search country…"
                placeholderTextColor={theme.textMuted}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(c) => c.iso}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.countryRow,
                    pressed && { backgroundColor: theme.background },
                  ]}
                  onPress={() => handleCountrySelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, code ${item.code}`}
                >
                  <Text style={styles.flagLarge}>{item.flag}</Text>
                  <Text style={[styles.countryName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.countryCode, { color: theme.textMuted }]}>{item.code}</Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    height: 58,
    paddingHorizontal: 12,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  flag: { fontSize: 22 },
  code: { fontSize: 15, fontWeight: '600' },
  divider: { width: 1, height: 28, marginHorizontal: 10 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  flagLarge: { fontSize: 26, marginRight: 12 },
  countryName: { flex: 1, fontSize: 15 },
  countryCode: { fontSize: 14 },
});
