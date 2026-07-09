import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ClipboardList, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BENEFIT_CATEGORIES } from '@/lib/supabase';
import { SupportRequest } from '@/lib/supabase';

type Props = {
  theme: any;
  styles: any;
  requests: SupportRequest[];
  formatDate: (dateString: string) => string;
  getStatusConfig: (t: any) => Record<string, { color: string; label: string; bg: string }>;
  onSeeAll: () => void;
};

export function RecentRequests({ theme, styles, requests, formatDate, getStatusConfig, onSeeAll }: Props) {
  const { t } = useTranslation();

  if (requests.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.recentActivity')}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll') || 'Ver tudo'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.activityList, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
        {requests.map((request, idx) => {
          const statusCfg = getStatusConfig(t);
          const cfg = statusCfg[request.status as keyof typeof statusCfg];

          return (
            <TouchableOpacity
              key={request.id}
              style={[styles.activityItem, {
                borderBottomColor: theme.cardBorderAlt,
                borderBottomWidth: idx < requests.length - 1 ? 1 : 0,
              }]}
              onPress={onSeeAll}
              activeOpacity={0.7}
            >
              <View style={[styles.activityIcon, { backgroundColor: cfg.bg }]}>
                <ClipboardList size={18} color={cfg.color} strokeWidth={1.8} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>
                  {BENEFIT_CATEGORIES[request.category as keyof typeof BENEFIT_CATEGORIES]?.title || 'Pedido de Suporte'}
                </Text>
                <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {request.message.substring(0, 48)}…
                </Text>
              </View>
              <View style={styles.activityMeta}>
                <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} color={theme.textMuted} />
                  <Text style={[styles.activityTime, { color: theme.textMuted }]}>{formatDate(request.created_at)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
