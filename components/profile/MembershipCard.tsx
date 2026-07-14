import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Shield, ChevronRight } from 'lucide-react-native';

interface PlanInfo {
  name: string;
  price: number;
  benefits: readonly any[];
}

interface SubscriptionData {
  start_date: string | null;
  next_billing_date: string | null;
  status: string;
}

interface MembershipCardProps {
  theme: any;
  planInfo: PlanInfo | null;
  subscriptionData: SubscriptionData | null;
  onPressPlan: () => void;
  t: (key: string) => string;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MembershipCard({ theme, planInfo, subscriptionData, onPressPlan, t }: MembershipCardProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      {planInfo && (
        <View style={styles.membershipSection}>
          <Text style={styles.sectionTitle}>{t('profile.currentPlan')}</Text>
          <TouchableOpacity
            style={styles.membershipCard}
            onPress={onPressPlan}
            accessibilityLabel={t('profile.currentPlan')}
            accessibilityRole="button"
            accessibilityHint="Opens plan details"
          >
            <View style={styles.membershipHeader}>
              <View style={styles.membershipBadge}>
                <Shield size={20} color={theme.primary} />
              </View>
              <View style={styles.membershipInfo}>
                <Text style={styles.membershipName}>
                  {planInfo.name} {t('profile.plan') || 'Plan'}
                </Text>
                <Text style={styles.membershipPrice}>
                  ${planInfo.price}/{t('profile.month') || 'month'}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </View>
            <View style={styles.membershipDivider} />
            <View style={styles.membershipStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{planInfo.benefits.length}</Text>
                <Text style={styles.statLabel}>{t('profile.benefitsCount')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>{t('profile.support247')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>{t('profile.protected100')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {subscriptionData && (
        <View style={styles.subscriptionSection}>
          <Text style={styles.sectionTitle}>{t('profile.subscription')}</Text>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionLabel}>{t('profile.startDate')}:</Text>
            <Text style={styles.subscriptionValue}>{formatDate(subscriptionData.start_date)}</Text>
          </View>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionLabel}>{t('profile.nextBilling')}:</Text>
            <Text style={styles.subscriptionValue}>{formatDate(subscriptionData.next_billing_date)}</Text>
          </View>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionLabel}>{t('profile.status')}:</Text>
            <Text style={styles.subscriptionValue}>{subscriptionData.status}</Text>
          </View>
        </View>
      )}
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    membershipSection: {
      marginTop: 30,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    membershipCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    membershipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    membershipBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    membershipInfo: {
      flex: 1,
    },
    membershipName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    membershipPrice: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    membershipDivider: {
      height: 1,
      backgroundColor: theme.cardBorderAlt,
      marginBottom: 16,
    },
    membershipStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.accent,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.cardBorderAlt,
    },
    subscriptionSection: {
      marginTop: 20,
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    subscriptionInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    subscriptionLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    subscriptionValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
  });
