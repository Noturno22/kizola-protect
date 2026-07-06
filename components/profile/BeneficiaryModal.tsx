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
import { User, FileText, X } from 'lucide-react-native';
import type { BeneficiaryRelationship } from '@/hooks/useBeneficiaries';

interface BeneficiaryModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  editingId: string | null;
  relationship: BeneficiaryRelationship;
  fullName: string;
  document: string;
  saving: boolean;
  onChangeRelationship: (v: BeneficiaryRelationship) => void;
  onChangeFullName: (v: string) => void;
  onChangeDocument: (v: string) => void;
  onSave: () => void;
}

const RELATIONSHIPS: BeneficiaryRelationship[] = ['Filho', 'Mulher', 'Outro'];

export default function BeneficiaryModal({
  visible,
  onClose,
  theme,
  editingId,
  relationship,
  fullName,
  document,
  saving,
  onChangeRelationship,
  onChangeFullName,
  onChangeDocument,
  onSave,
}: BeneficiaryModalProps) {
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
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar Beneficiário' : 'Adicionar Beneficiário'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close" accessibilityRole="button">
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Tipo</Text>
              <View style={styles.relationshipRow}>
                {RELATIONSHIPS.map((rel) => {
                  const active = relationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => onChangeRelationship(rel)}
                      style={[styles.relationshipChip, active && styles.relationshipChipActive]}
                      accessibilityLabel={rel}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.relationshipChipText, active && styles.relationshipChipTextActive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={onChangeFullName}
                    placeholder="Ex.: Maria da Silva"
                    placeholderTextColor={theme.textMuted}
                    accessibilityLabel="Full Name"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Documento</Text>
                <View style={styles.inputWrapper}>
                  <FileText size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={document}
                    onChangeText={onChangeDocument}
                    placeholder="Ex.: BI / NIF / RG / CPF"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="characters"
                    accessibilityLabel="Document"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={onSave}
                disabled={saving}
                accessibilityLabel="Save beneficiary"
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
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
    relationshipRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },
    relationshipChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      backgroundColor: theme.background,
      alignItems: 'center',
    },
    relationshipChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    relationshipChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    relationshipChipTextActive: {
      color: '#FFFFFF',
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
