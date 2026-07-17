import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Edit3, Trash2, Plus, Users } from 'lucide-react-native';
import type { Beneficiary } from '@/hooks/useBeneficiaries';

interface BeneficiariesSectionProps {
  theme: any;
  beneficiaries: Beneficiary[];
  onAdd: () => void;
  onEdit: (b: Beneficiary) => void;
  onDelete: (b: Beneficiary) => void;
  t: (key: string) => string;
}

function maskDocument(value: string) {
  const clean = (value || '').replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `${'*'.repeat(Math.min(8, clean.length - 4))}${clean.slice(-4)}`;
}

export default function BeneficiariesSection({
  theme,
  beneficiaries,
  onAdd,
  onEdit,
  onDelete,
  t,
}: BeneficiariesSectionProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.beneficiariesSection}>
      <View style={styles.beneficiariesHeader}>
        <Text style={styles.sectionTitle}>{t('profile.beneficiaries')}</Text>
        <TouchableOpacity
          style={styles.addBeneficiaryButton}
          onPress={onAdd}
          accessibilityLabel={t('profile.add')}
          accessibilityRole="button"
          accessibilityHint="Opens form to add a new beneficiary"
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBeneficiaryText}>{t('profile.add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.beneficiariesCard}>
        {beneficiaries.length === 0 ? (
          <View style={styles.beneficiariesEmpty}>
            <View style={styles.beneficiariesEmptyIcon}>
              <Users size={22} color={theme.primary} />
            </View>
            <View style={styles.beneficiariesEmptyText}>
              <Text style={styles.beneficiariesEmptyTitle}>{t('profile.none')}</Text>
              <Text style={styles.beneficiariesEmptySubtitle}>
                {t('profile.noneSubtitle')}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.beneficiariesList}>
            {beneficiaries.map((b, idx) => (
              <View
                key={b.id}
                style={[
                  styles.beneficiaryRow,
                  idx === beneficiaries.length - 1 && styles.beneficiaryRowLast,
                ]}
              >
                <View style={styles.beneficiaryMeta}>
                  <Text style={styles.beneficiaryName}>{b.fullName}</Text>
                  <Text style={styles.beneficiarySub}>
                    {b.relationship} • {maskDocument(b.document)}
                  </Text>
                </View>
                <View style={styles.beneficiaryActions}>
                  <TouchableOpacity
                    style={[styles.beneficiaryIconButton, styles.beneficiaryIconButtonEdit]}
                    onPress={() => onEdit(b)}
                    accessibilityLabel={`Edit ${b.fullName}`}
                    accessibilityRole="button"
                    accessibilityHint="Edits this beneficiary"
                  >
                    <Edit3 size={18} color={theme.warning} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.beneficiaryIconButton, styles.beneficiaryIconButtonDelete]}
                    onPress={() => onDelete(b)}
                    accessibilityLabel={`Delete ${b.fullName}`}
                    accessibilityRole="button"
                    accessibilityHint="Removes this beneficiary"
                  >
                    <Trash2 size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    beneficiariesSection: {
      marginTop: 30,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    beneficiariesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    addBeneficiaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.accent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    addBeneficiaryText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    beneficiariesCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    beneficiariesEmpty: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    beneficiariesEmptyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    beneficiariesEmptyText: {
      flex: 1,
    },
    beneficiariesEmptyTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    beneficiariesEmptySubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    beneficiariesList: {
      gap: 10,
    },
    beneficiaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    beneficiaryRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    beneficiaryMeta: {
      flex: 1,
    },
    beneficiaryName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    beneficiarySub: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    beneficiaryActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    beneficiaryIconButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    beneficiaryIconButtonEdit: {
      backgroundColor: theme.warning + '15',
    },
    beneficiaryIconButtonDelete: {
      backgroundColor: theme.error + '15',
    },
  });
