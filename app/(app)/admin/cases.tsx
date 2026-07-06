import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  MessageSquare,
  Home,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Filter,
  Search,
  ChevronRight,
  MapPin,
  FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CaseItem {
  case_type: 'support' | 'housing' | 'finance';
  id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'resolved' | 'cancelled';
  sub_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  description: string;
  // Extra fields that we fetch if needed or details
  nome?: string;
  email?: string;
  telefone?: string;
  estado?: string;
  cidade?: string;
  situacao_atual?: string;
}

export default function AdminCases() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'support' | 'housing' | 'finance'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      // Query the unified view
      const { data, error } = await supabase
        .from('admin_cases_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback if view doesn't exist yet or is offline
        console.warn('Could not query admin_cases_overview view, fetching from individual tables', error);
        await fetchIndividualCases();
        return;
      }

      setCases(data || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchIndividualCases = async () => {
    try {
      const [supportRes, housingRes, financeRes] = await Promise.all([
        supabase.from('support_requests').select('*'),
        supabase.from('housing_requests').select('*'),
        supabase.from('finance_requests').select('*')
      ]);

      const supportItems = (supportRes.data || []).map(item => ({
        case_type: 'support' as const,
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        sub_type: item.category,
        priority: item.priority || 'medium',
        created_at: item.created_at,
        updated_at: item.updated_at,
        description: item.message,
        nome: item.name,
        email: item.email
      }));

      const housingItems = (housingRes.data || []).map(item => ({
        case_type: 'housing' as const,
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        sub_type: item.necessidade,
        priority: 'medium' as const,
        created_at: item.created_at,
        updated_at: item.updated_at,
        description: item.observacoes || '',
        nome: item.nome,
        email: item.email,
        telefone: item.telefone,
        estado: item.estado,
        cidade: item.cidade,
        situacao_atual: item.situacao_atual
      }));

      const financeItems = (financeRes.data || []).map(item => ({
        case_type: 'finance' as const,
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        sub_type: item.tipo_ajuda,
        priority: 'medium' as const,
        created_at: item.created_at,
        updated_at: item.updated_at,
        description: item.descricao,
        nome: item.nome,
        email: item.email,
        estado: item.estado,
        observacoes: item.observacoes
      }));

      const allItems = [...supportItems, ...housingItems, ...financeItems] as CaseItem[];
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCases(allItems);
    } catch (err) {
      console.error('Error fetching individual tables:', err);
    }
  };

  const updateCaseStatus = async (caseId: string, type: 'support' | 'housing' | 'finance', newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const tableName = type === 'support' ? 'support_requests' : type === 'housing' ? 'housing_requests' : 'finance_requests';
      
      // Adapt status for support_requests if necessary (it has completed/cancelled instead of resolved/cancelled)
      let statusToSave = newStatus;
      if (type === 'support') {
        if (newStatus === 'resolved') statusToSave = 'completed';
      } else {
        if (newStatus === 'completed') statusToSave = 'resolved';
      }

      const { error } = await supabase
        .from(tableName)
        .update({ status: statusToSave, updated_at: new Date().toISOString() })
        .eq('id', caseId);

      if (error) throw error;

      // Log in audit log
      try {
        await supabase.from('auth_audit_logs').insert({
          action: 'admin_action',
          resource: tableName,
          details: { case_id: caseId, old_status: selectedCase?.status, new_status: statusToSave }
        });
      } catch (logErr) {
        console.warn('Failed to insert audit log:', logErr);
      }

      Alert.alert('Sucesso', 'Estado do caso atualizado com sucesso.');
      setSelectedCase(null);
      fetchCases();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao atualizar o estado do caso.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getCaseIcon = (type: 'support' | 'housing' | 'finance', size = 20, color = '#FFF') => {
    switch (type) {
      case 'support':
        return <MessageSquare size={size} color={color} />;
      case 'housing':
        return <Home size={size} color={color} />;
      case 'finance':
        return <DollarSign size={size} color={color} />;
    }
  };

  const getStatusDetails = (status: string) => {
    const norm = status.toLowerCase();
    if (norm === 'completed' || norm === 'resolved') {
      return { label: 'Concluído', color: theme.success, icon: CheckCircle2 };
    }
    if (norm === 'in_progress') {
      return { label: 'Em Progresso', color: theme.accent, icon: Clock };
    }
    if (norm === 'pending') {
      return { label: 'Pendente', color: theme.warning, icon: AlertCircle };
    }
    return { label: 'Cancelado', color: theme.error, icon: AlertCircle };
  };

  const filteredCases = useMemo(() => {
    return cases.filter(item => {
      // Tab filter
      if (selectedTab !== 'all' && item.case_type !== selectedTab) return false;

      // Status filter
      const normStatus = item.status.toLowerCase();
      if (statusFilter === 'pending' && normStatus !== 'pending') return false;
      if (statusFilter === 'in_progress' && normStatus !== 'in_progress') return false;
      if (statusFilter === 'resolved' && normStatus !== 'completed' && normStatus !== 'resolved') return false;

      // Search filter
      if (search.trim() === '') return true;
      const term = search.toLowerCase();
      return (
        item.description?.toLowerCase().includes(term) ||
        item.sub_type?.toLowerCase().includes(term) ||
        item.nome?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
      );
    });
  }, [cases, selectedTab, statusFilter, search]);

  const renderCaseItem = ({ item }: { item: CaseItem }) => {
    const statusInfo = getStatusDetails(item.status);
    const StatusIcon = statusInfo.icon;
    const typeLabel = item.case_type === 'support' ? 'Suporte' : item.case_type === 'housing' ? 'Habitação' : 'Finanças';
    const typeColor = item.case_type === 'support' ? '#3B82F6' : item.case_type === 'housing' ? '#F59E0B' : '#8B5CF6';

    return (
      <TouchableOpacity
        style={[styles.caseCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
        onPress={() => setSelectedCase(item)}
        activeOpacity={0.8}
      >
        <View style={styles.caseHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            {getCaseIcon(item.case_type, 14, typeColor)}
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.caseSubType, { color: theme.text }]}>
          {item.sub_type.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={[styles.caseDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.caseFooter}>
          <View style={styles.userInfo}>
            <User size={14} color={theme.textMuted} />
            <Text style={[styles.userName, { color: theme.textSecondary }]}>
              {item.nome || 'Membro Kizola'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
            <StatusIcon size={12} color={statusInfo.color} />
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
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
        <Text style={[styles.title, { color: theme.text }]}>Gestão de Casos</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Pesquisar por nome, email ou descrição..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'all' && [styles.activeTabButton, { backgroundColor: theme.accent }]]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'all' ? '#FFF' : theme.textSecondary }]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'support' && [styles.activeTabButton, { backgroundColor: theme.accent }]]}
            onPress={() => setSelectedTab('support')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'support' ? '#FFF' : theme.textSecondary }]}>Suporte</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'housing' && [styles.activeTabButton, { backgroundColor: theme.accent }]]}
            onPress={() => setSelectedTab('housing')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'housing' ? '#FFF' : theme.textSecondary }]}>Habitação</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'finance' && [styles.activeTabButton, { backgroundColor: theme.accent }]]}
            onPress={() => setSelectedTab('finance')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'finance' ? '#FFF' : theme.textSecondary }]}>Finanças</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Status Filter Badges */}
      <View style={styles.statusFilters}>
        <TouchableOpacity
          style={[styles.statusFilterBadge, statusFilter === 'all' && styles.statusFilterBadgeActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.statusFilterText, statusFilter === 'all' && styles.statusFilterTextActive, { color: theme.textSecondary }]}>Todos Estados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusFilterBadge, statusFilter === 'pending' && { borderColor: theme.warning }]}
          onPress={() => setStatusFilter('pending')}
        >
          <View style={[styles.statusFilterDot, { backgroundColor: theme.warning }]} />
          <Text style={[styles.statusFilterText, { color: theme.textSecondary }]}>Pendente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusFilterBadge, statusFilter === 'in_progress' && { borderColor: theme.accent }]}
          onPress={() => setStatusFilter('in_progress')}
        >
          <View style={[styles.statusFilterDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.statusFilterText, { color: theme.textSecondary }]}>Em progresso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusFilterBadge, statusFilter === 'resolved' && { borderColor: theme.success }]}
          onPress={() => setStatusFilter('resolved')}
        >
          <View style={[styles.statusFilterDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.statusFilterText, { color: theme.textSecondary }]}>Resolvido</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>A carregar casos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          renderItem={renderCaseItem}
          keyExtractor={(item) => `${item.case_type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={64} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum caso encontrado.</Text>
            </View>
          }
        />
      )}

      {/* Case Details Modal */}
      <Modal
        visible={selectedCase !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCase(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSelectedCase(null)}
          />
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            {selectedCase && (
              <>
                <View style={styles.modalDragIndicator} />
                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <View style={styles.modalHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: selectedCase.case_type === 'support' ? '#3B82F620' : selectedCase.case_type === 'housing' ? '#F59E0B20' : '#8B5CF620' }]}>
                      {getCaseIcon(selectedCase.case_type, 16, selectedCase.case_type === 'support' ? '#3B82F6' : selectedCase.case_type === 'housing' ? '#F59E0B' : '#8B5CF6')}
                      <Text style={[styles.typeBadgeText, { color: selectedCase.case_type === 'support' ? '#3B82F6' : selectedCase.case_type === 'housing' ? '#F59E0B' : '#8B5CF6' }]}>
                        {selectedCase.case_type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      {new Date(selectedCase.created_at).toLocaleString()}
                    </Text>
                  </View>

                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedCase.sub_type.replace('_', ' ').toUpperCase()}
                  </Text>

                  {/* Client Info Block */}
                  <View style={[styles.detailsBlock, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.blockTitle, { color: theme.text }]}>Dados do Cliente</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Nome:</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{selectedCase.nome || 'Não fornecido'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Email:</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{selectedCase.email || 'Não fornecido'}</Text>
                    </View>
                    {selectedCase.telefone && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Telefone:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>{selectedCase.telefone}</Text>
                      </View>
                    )}
                    {selectedCase.estado && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Localização:</Text>
                        <View style={styles.locationValue}>
                          <MapPin size={12} color={theme.textSecondary} />
                          <Text style={[styles.detailValue, { color: theme.text }]}>{selectedCase.cidade ? `${selectedCase.cidade}, ` : ''}{selectedCase.estado}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Situation / Description Block */}
                  {selectedCase.situacao_atual && (
                    <View style={[styles.detailsBlock, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.blockTitle, { color: theme.text }]}>Situação Atual</Text>
                      <Text style={[styles.blockText, { color: theme.textSecondary }]}>{selectedCase.situacao_atual}</Text>
                    </View>
                  )}

                  <View style={[styles.detailsBlock, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.blockTitle, { color: theme.text }]}>Descrição / Observações</Text>
                    <Text style={[styles.blockText, { color: theme.textSecondary }]}>{selectedCase.description || 'Sem observações adicionais.'}</Text>
                  </View>

                  {/* Action Buttons to Change Status */}
                  <View style={styles.actionsContainer}>
                    <Text style={[styles.blockTitle, { color: theme.text, marginBottom: 12 }]}>Atualizar Estado</Text>
                    
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={[styles.statusButton, { borderColor: theme.warning }, selectedCase.status === 'pending' && { backgroundColor: theme.warning }]}
                        onPress={() => updateCaseStatus(selectedCase.id, selectedCase.case_type, 'pending')}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusButtonText, { color: selectedCase.status === 'pending' ? '#FFF' : theme.warning }]}>Pendente</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.statusButton, { borderColor: theme.accent }, selectedCase.status === 'in_progress' && { backgroundColor: theme.accent }]}
                        onPress={() => updateCaseStatus(selectedCase.id, selectedCase.case_type, 'in_progress')}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusButtonText, { color: selectedCase.status === 'in_progress' ? '#FFF' : theme.accent }]}>Em Progresso</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.statusButton, { borderColor: theme.success }, (selectedCase.status === 'completed' || selectedCase.status === 'resolved') && { backgroundColor: theme.success }]}
                        onPress={() => updateCaseStatus(selectedCase.id, selectedCase.case_type, 'resolved')}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusButtonText, { color: (selectedCase.status === 'completed' || selectedCase.status === 'resolved') ? '#FFF' : theme.success }]}>Concluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  activeTabButton: {
    borderWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusFilters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statusFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusFilterBadgeActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusFilterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusFilterTextActive: {
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  caseCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  caseSubType: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  caseDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 80,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  detailsBlock: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 15,
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
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blockText: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
