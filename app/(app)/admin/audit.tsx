import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  User,
  Info,
  RefreshCw,
  Eye,
  CheckCircle2,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

const ACTION_TYPES = [
  'login',
  'logout',
  'password_reset_requested',
  'password_reset_completed',
  'plan_change',
  'data_update',
  'data_delete',
  'admin_action',
  'profile_created',
  'housing_request_submitted',
  'finance_request_submitted',
] as const;

export default function AdminAudit() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('auth_audit_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      // Apply date filter
      const now = new Date();
      if (dateFilter === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte('created_at', startOfDay.toISOString());
      } else if (dateFilter === 'week') {
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', startOfMonth.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Failed to fetch from auth_audit_logs table, using offline demo logs', error);
        generateDemoLogs();
        return;
      }

      let formattedLogs = (data || []).map((log: any) => ({
        ...log,
        profiles: log.profiles ? {
          email: log.profiles.email,
          full_name: log.profiles.full_name
        } : undefined
      })) as AuditLogItem[];

      // Apply action filter
      if (actionFilter !== 'all') {
        formattedLogs = formattedLogs.filter(log => log.action === actionFilter);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        formattedLogs = formattedLogs.filter(log => 
          log.action.toLowerCase().includes(queryLower) ||
          log.resource?.toLowerCase().includes(queryLower) ||
          log.profiles?.email?.toLowerCase().includes(queryLower) ||
          log.profiles?.full_name?.toLowerCase().includes(queryLower) ||
          log.ip_address?.toLowerCase().includes(queryLower) ||
          JSON.stringify(log.details).toLowerCase().includes(queryLower)
        );
      }

      setLogs(formattedLogs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [actionFilter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const generateDemoLogs = () => {
    const demoLogs: AuditLogItem[] = [
      {
        id: '1',
        user_id: 'u1',
        action: 'login',
        resource: 'auth',
        details: { method: 'phone_otp' },
        ip_address: '192.168.1.45',
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        profiles: { email: 'migrante.jose@kizola.com', full_name: 'José Silva' }
      },
      {
        id: '2',
        user_id: 'u2',
        action: 'plan_change',
        resource: 'subscriptions',
        details: { old_plan: 'free', new_plan: 'premium', amount: 33.99 },
        ip_address: '172.56.21.90',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        profiles: { email: 'maria.immigrant@kizola.com', full_name: 'Maria Santos' }
      },
      {
        id: '3',
        user_id: 'u3',
        action: 'admin_action',
        resource: 'housing_requests',
        details: { request_id: 'hr_908', old_status: 'pending', new_status: 'in_progress' },
        ip_address: '192.168.0.101',
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        profiles: { email: 'Jeronimo.samaina239898@gmail.com', full_name: 'Jeronimo Samaina' }
      },
      {
        id: '4',
        user_id: 'u1',
        action: 'data_update',
        resource: 'profiles',
        details: { updated_fields: ['phone', 'full_name'] },
        ip_address: '192.168.1.45',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        profiles: { email: 'migrante.jose@kizola.com', full_name: 'José Silva' }
      }
    ];
    setLogs(demoLogs);
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('remove')) return theme.error;
    if (act.includes('update') || act.includes('change')) return theme.warning;
    if (act.includes('login') || act.includes('created')) return theme.success;
    if (act.includes('admin')) return '#8B5CF6';
    return theme.textSecondary;
  };

  const getActionLabel = (action: string) => {
    const act = action.toLowerCase();
    if (act === 'login') return 'Login de Membro';
    if (act === 'logout') return 'Logout de Membro';
    if (act === 'password_reset_requested') return 'Recuperação Iniciada';
    if (act === 'password_reset_completed') return 'Senha Redefinida';
    if (act === 'plan_change') return 'Mudança de Plano';
    if (act === 'data_update') return 'Dados Alterados';
    if (act === 'data_delete') return 'Exclusão de Dados';
    if (act === 'admin_action') return 'Ação de Administrador';
    if (act === 'profile_created') return 'Conta Criada';
    return action.toUpperCase();
  };

  const renderLogItem = ({ item }: { item: AuditLogItem }) => {
    const actionColor = getActionColor(item.action);

    return (
      <TouchableOpacity
        style={[styles.logCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
        onPress={() => setSelectedLog(item)}
        activeOpacity={0.8}
      >
        <View style={styles.logHeader}>
          <View style={[styles.actionBadge, { backgroundColor: actionColor + '15' }]}>
            <View style={[styles.actionDot, { backgroundColor: actionColor }]} />
            <Text style={[styles.actionBadgeText, { color: actionColor }]}>
              {getActionLabel(item.action)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.logUserInfo}>
          <User size={14} color={theme.textMuted} />
          <Text style={[styles.userText, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.profiles?.email || 'Sistema (Automático)'}
          </Text>
        </View>

        {item.resource && (
          <Text style={[styles.resourceText, { color: theme.textMuted }]}>
            Tabela / Módulo: {item.resource}
          </Text>
        )}
      </TouchableOpacity>
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
        <Text style={[styles.title, { color: theme.text }]}>Registros de Auditoria</Text>
        <TouchableOpacity onPress={fetchAuditLogs} style={styles.backButton}>
          <RefreshCw size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <>
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <TouchableOpacity
              style={[styles.filterToggle, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={theme.text} />
              <Text style={[styles.filterToggleText, { color: theme.text }]}>
                Filtros {showFilters ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            <View style={[styles.searchWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
              <Search size={20} color={theme.textMuted} />
              <TextInput
                placeholder="Pesquisar por ação, usuário, IP, recurso..."
                placeholderTextColor={theme.textMuted}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {showFilters && (
            <View style={styles.filtersContainer}>
              {/* Action Filter */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>Tipo de Ação</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  <TouchableOpacity
                    style={[styles.filterChip, actionFilter === 'all' && styles.filterChipActive, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                    onPress={() => setActionFilter('all')}
                  >
                    <Text style={[styles.filterChipText, { color: actionFilter === 'all' ? '#FFF' : theme.textSecondary }]}>Todas</Text>
                  </TouchableOpacity>
                  {ACTION_TYPES.map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[styles.filterChip, actionFilter === action && styles.filterChipActive, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                      onPress={() => setActionFilter(action)}
                    >
                      <Text style={[styles.filterChipText, { color: actionFilter === action ? '#FFF' : theme.textSecondary }]}>
                        {getActionLabel(action)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date Filter */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>Período</Text>
                <View style={styles.dateFilterRow}>
                  {(['all', 'today', 'week', 'month'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[styles.periodButton, dateFilter === period && styles.periodButtonActive]}
                      onPress={() => setDateFilter(period)}
                    >
                      <Text style={[styles.periodText, { color: dateFilter === period ? '#FFF' : theme.textSecondary }]}>
                        {period === 'all' ? 'Todo Histórico' : period === 'today' ? 'Hoje' : period === 'week' ? 'Última Semana' : 'Este Mês'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Results count */}
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { color: theme.textSecondary }]}>
              {logs.length} registro{logs.length !== 1 ? 's' : ''} encontrado{logs.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ShieldAlert size={64} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum registro de segurança encontrado.</Text>
              </View>
            }
          />
        </>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSelectedLog(null)}
          />
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalDragIndicator} />
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Detalhes da Ação</Text>

              <View style={[styles.detailsBlock, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <Text style={[styles.blockTitle, { color: theme.text }]}>Rastreabilidade</Text>
                
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Tipo de Ação:</Text>
                  <Text style={[styles.detailValue, { color: getActionColor(selectedLog.action) }]}>
                    {getActionLabel(selectedLog.action)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Email:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedLog.profiles?.email || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Nome Completo:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedLog.profiles?.full_name || 'Sistema'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Endereço IP:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedLog.ip_address || 'Não registrado'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Horário:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailsBlock, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <Text style={[styles.blockTitle, { color: theme.text }]}>Dados Adicionais (JSON)</Text>
                <Text style={[styles.jsonText, { color: theme.textSecondary }]}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.accent }]}
                onPress={() => setSelectedLog(null)}
              >
                <Text style={styles.closeButtonText}>Fechar Detalhes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  logUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resourceText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsInfo: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: '60%',
    paddingTop: 12,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailsBlock: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  jsonText: {
    fontFamily: 'Courier',
    fontSize: 12,
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
