import { View, Text, ScrollView } from 'react-native';
import { FolderOpen, FileCheck, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface StatsRowProps {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

export function StatsRow({ total, verified, pending, rejected }: StatsRowProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginBottom: 20 }}>
      <View style={{ width: 110, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: theme.primary + '15' }}>
          <FolderOpen size={20} color={theme.primary} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 2, color: theme.primary }}>{total}</Text>
        <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.textMuted }}>{t('documents.total') || 'Total'}</Text>
      </View>
      <View style={{ width: 110, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: theme.success + '15' }}>
          <FileCheck size={20} color={theme.success} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 2, color: theme.success }}>{verified}</Text>
        <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.textMuted }}>{t('documents.verified') || 'Verificados'}</Text>
      </View>
      <View style={{ width: 110, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: '#F59E0B15' }}>
          <Clock size={20} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 2, color: '#F59E0B' }}>{pending}</Text>
        <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.textMuted }}>{t('documents.pending') || 'Pendentes'}</Text>
      </View>
      {rejected > 0 && (
        <View style={{ width: 110, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: theme.error + '15' }}>
            <AlertCircle size={20} color={theme.error} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 2, color: theme.error }}>{rejected}</Text>
          <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.textMuted }}>{t('documents.rejected') || 'Rejeitados'}</Text>
        </View>
      )}
    </ScrollView>
  );
}
