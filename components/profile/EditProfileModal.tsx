import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMemo } from 'react';
import { User, Mail, Phone, X, Globe } from 'lucide-react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  nationalityFlag?: string;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeNationality?: (code: string, flag: string) => void;
  onSave: () => void;
  loading: boolean;
  t: (key: string) => string;
  onOpenCountryPicker?: () => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  theme,
  name,
  email,
  phone,
  nationality,
  nationalityFlag,
  onChangeName,
  onChangeEmail,
  onChangePhone,
  onSave,
  loading,
  t,
  onOpenCountryPicker,
}: EditProfileModalProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.editProfile')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close" accessibilityRole="button">
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('profile.fullName') || 'Full Name'}</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={onChangeName}
                    placeholder={t('auth.fullName')}
                    placeholderTextColor={theme.textMuted}
                    accessibilityLabel="Full Name"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('profile.emailAddress') || 'Email Address'}</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={onChangeEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    accessibilityLabel="Email Address"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('profile.phoneNumber') || 'Phone Number (Optional)'}</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={onChangePhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                    accessibilityLabel="Phone Number"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              {/* Nationality */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('profile.nationality') || 'Nationality'}</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={onOpenCountryPicker}
                  accessibilityLabel={nationality ? `${t('profile.nationality')}: ${nationality}` : t('profile.selectNationality')}
                  accessibilityRole="button"
                >
                  <Globe size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <View style={styles.nationalityContent}>
                    {nationalityFlag ? (
                      <Text style={styles.nationalityFlag}>{nationalityFlag}</Text>
                    ) : null}
                    <Text style={[styles.nationalityText, !nationality && styles.placeholder]}>
                      {nationality || t('profile.selectNationality')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={onSave}
                disabled={loading}
                accessibilityLabel="Save profile"
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
      maxHeight: '80%',
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
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      paddingHorizontal: 14,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 15,
      color: theme.text,
    },
    nationalityContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
    },
    nationalityFlag: {
      fontSize: 24,
      marginRight: 10,
    },
    nationalityText: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
    },
    placeholder: {
      color: theme.textMuted,
    },
    saveButton: {
      backgroundColor: theme.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
