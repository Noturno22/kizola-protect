import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Shield
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface SubscriptionItem {
  id: string;
  user_id: string;
  plan_id: 'free' | 'basic' | 'pro' | 'premium';
  status: string;
  start_date: string;
  next_billing_date: string;
  email?: string;
  nome?: string;
}

export default function AdminFinance() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const PLANS_PRICES = { free: 0, basic: 27.99, pro: 29.99, premium: 33.99 };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch active/all subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      const formattedSubs = (subsData || []).map((sub: any) => ({
        id: sub.id,
        user_id: sub.user_id,
        plan_id: sub.plan_id,
        status: sub.status,
        start_date: sub.start_date,
        next_billing_date: sub.next_billing_date,
        nome: sub.profiles?.full_name,
        email: sub.profiles?.email
      }));

      setSubscriptions(formattedSubs);
    } catch (err) {
      console.error('Error fetching subscription finance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculations
  const metrics = useMemo(() => {
    let activeSubs = subscriptions.filter(s => s.status === 'active');
    let mrr = 0;
    let planCounts = { free: 0, basic: 0, pro: 0, premium: 0 };

    activeSubs.forEach(sub => {
      const price = PLANS_PRICES[sub.plan_id] || 0;
      mrr += price;
      if (sub.plan_id in planCounts) {
        planCounts[sub.plan_id]++;
      }
    });

    const arr = mrr * 12;

    return {
      mrr,
      arr,
      activeSubsCount: activeSubs.length,
      planCounts
    };
  }, [subscriptions]);

  const renderSubItem = ({ item }: { item: SubscriptionItem }) => {
    const price = PLANS_PRICES[item.plan_id] || 0;
    const planColor = item.plan_id === 'premium' ? '#8B5CF6' : item.plan_id === 'pro' ? '#0EA5E9' : item.plan_id === 'basic' ? '#10B981' : '#94A3B8';

    return (
      <View style={[styles.transactionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
        <View style={styles.transHeader}>
          <View style={styles.transUser}>
            <View style={[styles.avatar, { backgroundColor: theme.background }]}>
              <User size={16} color={theme.textSecondary} />
            </View>
            <View>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                {item.nome || 'Membro Kizola'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
                {item.email || 'sem-email@kizola.com'}
              </Text>
            </View>
          </View>
          <Text style={[styles.transAmount, { color: theme.text }]}>
            ${price.toFixed(2)}<Text style={styles.periodText}>/mês</Text>
          </Text>
        </View>

        <View style={styles.transFooter}>
          <View style={[styles.planBadge, { backgroundColor: planColor + '15' }]}>
            <Shield size={12} color={planColor} />
            <Text style={[styles.planText, { color: planColor }]}>{item.plan_id.toUpperCase()}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Calendar size={12} color={theme.textMuted} />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              Próximo: {new Date(item.next_billing_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Painel Financeiro</Text>
        <TouchableOpacity onPress={fetchFinanceData} style={styles.backButton}>
          <RefreshCw size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Revenue Cards */}
          <View style={styles.metricsContainer}>
            <View style={[styles.metricCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.accent + '15' }]}>
                <TrendingUp size={24} color={theme.accent} />
              </View>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Receita Recorrente Mensal (MRR)</Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>${metrics.mrr.toFixed(2)}</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
              <View style={[styles.iconWrapper, { backgroundColor: '#8B5CF6' + '15' }]}>
                <DollarSign size={24} color="#8B5CF6" />
              </View>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Receita Recorrente Anual (ARR)</Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>${metrics.arr.toFixed(2)}</Text>
            </View>
          </View>

          {/* Stripe Status & Subscriptions Info */}
          <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Status da Integração</Text>
            
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <CreditCard size={20} color={theme.textSecondary} />
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Stripe Gateway</Text>
              </View>
              <View style={[styles.stripeBadge, { backgroundColor: theme.success + '15' }]}>
                <CheckCircle size={14} color={theme.success} />
                <Text style={[styles.stripeBadgeText, { color: theme.success }]}>LIGADO</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.planDistribution}>
              <Text style={[styles.distTitle, { color: theme.textSecondary }]}>Distribuição por Plano (Ativos)</Text>
              
              <View style={styles.distributionRow}>
                <View style={styles.distItem}>
                  <Text style={[styles.distNum, { color: '#10B981' }]}>{metrics.planCounts.basic}</Text>
                  <Text style={[styles.distName, { color: theme.textMuted }]}>Basic</Text>
                </View>
                <View style={styles.distItem}>
                  <Text style={[styles.distNum, { color: '#0EA5E9' }]}>{metrics.planCounts.pro}</Text>
                  <Text style={[styles.distName, { color: theme.textMuted }]}>Pro</Text>
                </View>
                <View style={styles.distItem}>
                  <Text style={[styles.distNum, { color: '#8B5CF6' }]}>{metrics.planCounts.premium}</Text>
                  <Text style={[styles.distName, { color: theme.textMuted }]}>Premium</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Transactions List Header */}
          <Text style={[styles.listTitle, { color: theme.text }]}>Membros com Assinatura Paga</Text>

          {subscriptions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <AlertTriangle size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhuma assinatura ativa no momento.</Text>
            </View>
          ) : (
            <FlatList
              data={subscriptions}
              renderItem={renderSubItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  stripeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stripeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  planDistribution: {
    marginTop: 4,
  },
  distTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distItem: {
    alignItems: 'center',
    flex: 1,
  },
  distNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  distName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  transactionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  transHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
  },
  transAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  periodText: {
    fontSize: 11,
    fontWeight: '500',
  },
  transFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
