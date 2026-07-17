import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Tag,
  AlertTriangle,
  X,
  MessageSquare
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, SupportRequest, isSupabaseConfigured } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { getSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#F59E0B', bgColor: '#FEF3C7', label: 'Pending' },
  in_progress: { icon: AlertCircle, color: '#3B82F6', bgColor: '#DBEAFE', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: '#22C55E', bgColor: '#DCFCE7', label: 'Completed' },
  cancelled: { icon: XCircle, color: '#EF4444', bgColor: '#FEE2E2', label: 'Cancelled' },
};

const PRIORITY_CONFIG = {
  low: { color: '#64748B', label: 'Low' },
  medium: { color: '#F59E0B', label: 'Medium' },
  high: { color: '#EF4444', label: 'High' },
  urgent: { color: '#DC2626', label: 'Urgent' },
};

const CATEGORY_LABELS: Record<string, string> = {
  legal: 'Legal Guidance',
  immigration: 'Immigration Support',
  tax: 'Tax Assistance',
  housing: 'Housing Support',
  education: 'Education & Scholarships',
  job: 'Job & Employment',
  emergency: 'Emergency Assistance',
  other: 'Other',
};

export default function Activity() {
  const { user, isDemoMode } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        const stored = await getSecureItem<SupportRequest[]>(SECURE_KEYS.SUPPORT_REQUESTS(user.id));
        if (stored) {
          setRequests(stored);
        }
        return;
      }

      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status: keyof typeof STATUS_CONFIG) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    let label = config.label;
    if (status === 'pending') label = t('activity.pending');
    else if (status === 'in_progress') label = t('activity.inProgress');
    else if (status === 'completed') label = t('activity.completed');
    else if (status === 'cancelled') label = t('common.cancelled');

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Icon size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{label}</Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Gradient background covering entire screen including status bar */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.35, 0.5]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('activity.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('activity.subtitle')}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>{t('activity.totalRequests')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {requests.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>{t('activity.pending')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {requests.filter(r => r.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>{t('activity.resolved')}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                  {f === 'all' ? t('activity.all') : f === 'in_progress' ? t('activity.inProgress') : f === 'pending' ? t('activity.pending') : t('activity.completed')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Requests List */}
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('activity.supportRequests')}</Text>
            <Text style={styles.sectionCount}>{filteredRequests.length} {t('activity.items')}</Text>
          </View>

          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FileText size={48} color={theme.accent} />
              </View>
              <Text style={styles.emptyTitle}>{t('activity.noRequests')}</Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all'
                  ? t('activity.noRequestsDesc')
                  : t('activity.noFilteredRequests', { filter: filter === 'in_progress' ? t('activity.inProgress') : filter === 'pending' ? t('activity.pending') : t('activity.completed') })}
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {filteredRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => setSelectedRequest(request)}
                >
                  <View style={styles.requestHeader}>
                    {getStatusBadge(request.status)}
                    <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_CONFIG[request.priority].color + '20' }]}>
                      <AlertTriangle size={12} color={PRIORITY_CONFIG[request.priority].color} />
                      <Text style={[styles.priorityText, { color: PRIORITY_CONFIG[request.priority].color }]}>
                        {PRIORITY_CONFIG[request.priority].label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestContent}>
                    <Text style={styles.requestCategory}>{CATEGORY_LABELS[request.category]}</Text>
                    <Text style={styles.requestMessage} numberOfLines={2}>
                      {request.message}
                    </Text>
                  </View>

                  <View style={styles.requestFooter}>
                    <View style={styles.requestDate}>
                      <Calendar size={14} color={theme.textMuted} />
                      <Text style={styles.requestDateText}>{formatDate(request.created_at)}</Text>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Request Detail Modal */}
      <Modal
        visible={selectedRequest !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('activity.requestDetails')}</Text>
              <TouchableOpacity onPress={() => setSelectedRequest(null)} style={styles.closeButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={styles.detailSection}>
                  {getStatusBadge(selectedRequest.status)}
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Tag size={18} color={theme.textMuted} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>{t('activity.category')}</Text>
                      <Text style={styles.detailValue}>{CATEGORY_LABELS[selectedRequest.category]}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <AlertTriangle size={18} color={theme.textMuted} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>{t('activity.priority')}</Text>
                      <Text style={[styles.detailValue, { color: PRIORITY_CONFIG[selectedRequest.priority].color }]}>
                        {PRIORITY_CONFIG[selectedRequest.priority].label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Calendar size={18} color={theme.textMuted} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>{t('activity.submitted')}</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedRequest.created_at)} at {formatTime(selectedRequest.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.messageHeader}>
                    <MessageSquare size={18} color={theme.accent} />
                    <Text style={styles.messageTitle}>{t('activity.yourMessage')}</Text>
                  </View>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{selectedRequest.message}</Text>
                  </View>
                </View>

                <View style={styles.statusTimeline}>
                  <Text style={styles.timelineTitle}>{t('activity.statusUpdates')}</Text>
                  <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, styles.timelineDotActive]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineStatus}>{t('activity.requestSubmitted')}</Text>
                        <Text style={styles.timelineDate}>{formatDate(selectedRequest.created_at)}</Text>
                      </View>
                    </View>
                    {selectedRequest.status !== 'pending' && (
                      <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, styles.timelineDotActive]} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineStatus}>{t('activity.inProgress')}</Text>
                          <Text style={styles.timelineDate}>{t('activity.reviewingRequest')}</Text>
                        </View>
                      </View>
                    )}
                    {selectedRequest.status === 'completed' && (
                      <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineStatus}>{t('activity.completed')}</Text>
                          <Text style={styles.timelineDate}>{t('activity.requestResolved')}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  filterContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  filterTabActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  sectionCount: {
    fontSize: 14,
    color: theme.textMuted,
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestContent: {
    marginBottom: 12,
  },
  requestCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.cardBorderAlt,
    paddingTop: 12,
  },
  requestDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestDateText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
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
  closeButton: {
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
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  messageBox: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  messageText: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 24,
  },
  statusTimeline: {
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.cardBorderAlt,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: theme.accent,
  },
  timelineDotCompleted: {
    backgroundColor: theme.success,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    color: theme.textMuted,
  },
});
