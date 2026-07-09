import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Eye, Download, X } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import type { LocalDocument } from './helpers';

interface PreviewModalProps {
  doc: LocalDocument | null;
  loading: boolean;
  onView: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export function PreviewModal({ doc, loading, onView, onDownload, onClose }: PreviewModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={!!doc} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, backgroundColor: theme.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', flex: 1, marginRight: 16, color: theme.text }} numberOfLines={1}>
              {doc?.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ marginTop: 12, fontSize: 14, color: theme.textMuted }}>{t('documents.opening') || 'A abrir documento...'}</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, backgroundColor: theme.primary }}
                onPress={onView}
              >
                <Eye size={20} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{t('documents.view') || 'Ver'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, backgroundColor: theme.success }}
                onPress={onDownload}
              >
                <Download size={20} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{t('documents.download') || 'Descarregar'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
