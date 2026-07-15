import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react-native';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  currentLanguage: string;
  onChangeLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'es-US', label: 'Español (EE.UU.)', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ln', label: 'Lingála', flag: '🇨🇩' },
];

export default function LanguageModal({
  visible,
  onClose,
  theme,
  currentLanguage,
  onChangeLanguage,
  t,
}: LanguageModalProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSelect = (code: string) => {
    onChangeLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close language selector"
        accessibilityRole="button"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close" accessibilityRole="button">
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((lang) => {
              const isActive = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.languageOption}
                  onPress={() => handleSelect(lang.code)}
                  accessibilityLabel={lang.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={styles.languageOptionContent}>
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text style={[styles.languageOptionText, isActive && styles.languageOptionTextActive]}>
                      {lang.label}
                    </Text>
                  </View>
                  {isActive && <CheckCircle2 size={20} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
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
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    modalCloseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBody: {
      padding: 20,
      paddingBottom: 30,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    languageOptionText: {
      fontSize: 16,
      color: theme.text,
    },
    languageOptionTextActive: {
      color: theme.accent,
      fontWeight: '600',
    },
    languageOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageFlag: {
      fontSize: 22,
      marginRight: 12,
    },
  });
