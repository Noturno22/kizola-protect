import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { Search, X, Globe } from 'lucide-react-native';
import { COUNTRIES, Country, getCountryName, searchCountries } from '@/lib/countries';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry?: string; // country code
  theme: any;
  t: (key: string) => string;
}

export default function CountryPickerModal({
  visible,
  onClose,
  onSelect,
  selectedCountry,
  theme,
  t,
}: CountryPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    return searchCountries(searchQuery, t('common.currentLanguage') || 'en');
  }, [searchQuery, t]);

  const handleSelect = useCallback((country: Country) => {
    onSelect(country);
    onClose();
    setSearchQuery('');
  }, [onSelect, onClose]);

  const renderCountry = useCallback(({ item }: { item: Country }) => {
    const isSelected = item.code === selectedCountry;
    const name = getCountryName(item, t('common.currentLanguage') || 'en');

    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.countryItemSelected]}
        onPress={() => handleSelect(item)}
        accessibilityLabel={`${item.flag} ${name}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
          {name}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedCountry, t, styles, handleSelect]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Globe size={20} color={theme.accent} />
              <Text style={styles.modalTitle}>{t('profile.selectNationality')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close" accessibilityRole="button">
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('profile.searchCountry')}
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search country"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountry}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
            contentContainerStyle={styles.countryListContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '85%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      paddingHorizontal: 14,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: theme.text,
    },
    clearButton: {
      padding: 4,
    },
    countryList: {
      flex: 1,
    },
    countryListContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 4,
    },
    countryItemSelected: {
      backgroundColor: theme.accent + '15',
    },
    countryFlag: {
      fontSize: 28,
      marginRight: 14,
    },
    countryName: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    countryNameSelected: {
      color: theme.accent,
      fontWeight: '600',
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
