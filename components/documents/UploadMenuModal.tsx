import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FolderOpen, Camera } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface UploadMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onPickFromGallery: () => void;
  onTakePhoto: () => void;
}

export function UploadMenuModal({ visible, onClose, onPickFromGallery, onTakePhoto }: UploadMenuModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{ width: '85%', borderRadius: 20, padding: 20, backgroundColor: theme.surface }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: theme.text }}>
            {t('documents.chooseSource') || 'Escolher origem'}
          </Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.cardBorderAlt }}
            onPress={onPickFromGallery}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: theme.primary + '15' }}>
              <FolderOpen size={22} color={theme.primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>{t('documents.gallery') || 'Galeria'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
            onPress={onTakePhoto}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: theme.success + '15' }}>
              <Camera size={22} color={theme.success} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>{t('documents.camera') || 'Câmera'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
