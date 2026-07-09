import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Bell, X, Info, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useNotifications } from '@/providers/NotificationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

const NOTIFICATION_ICONS: Record<string, React.ComponentType<any>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  alert: Bell,
};

const getNotificationColors = (isDark: boolean) => ({
  info: { bg: isDark ? '#1E3A5F' : '#DBEAFE', icon: '#3B82F6' },
  success: { bg: isDark ? '#14312A' : '#DCFCE7', icon: '#22C55E' },
  warning: { bg: isDark ? '#3B2A0A' : '#FEF3C7', icon: '#F59E0B' },
  alert: { bg: isDark ? '#3B1515' : '#FEE2E2', icon: '#EF4444' },
});

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const diffH = (Date.now() - date.getTime()) / 3600000;
  if (diffH < 1) return 'Agora';
  if (diffH < 24) return `${Math.floor(diffH)}h atrás`;
  if (diffH < 48) return 'Ontem';
  return date.toLocaleDateString('pt-AO', { month: 'short', day: 'numeric' });
}

export function NotificationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '82%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.cardBorderAlt }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>{t('dashboard.notifications') || 'Notificações'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: theme.accent + '18' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.accent }}>{t('dashboard.markAllAsRead') || 'Marcar todas'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 14 }}>
            {notifications.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 52, gap: 10 }}>
                <Bell size={44} color={theme.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Sem notificações</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>Está tudo em dia!</Text>
              </View>
            ) : (
              notifications.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type as keyof typeof NOTIFICATION_ICONS];
                const notifColors = getNotificationColors(isDark);
                const colors = notifColors[n.type as keyof typeof notifColors];
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 14, marginBottom: 8, backgroundColor: n.read ? 'transparent' : theme.notifBg }}
                    onPress={() => markAsRead(n.id)}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, backgroundColor: colors.bg }}>
                      <Icon size={18} color={colors.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 2 }}>{n.title}</Text>
                      <Text style={{ fontSize: 12, lineHeight: 17, color: theme.textSecondary, marginBottom: 4 }} numberOfLines={2}>{n.message}</Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>{formatDate(n.created_at)}</Text>
                    </View>
                    {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0, backgroundColor: theme.accent }} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
