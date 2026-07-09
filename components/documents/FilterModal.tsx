import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterModalProps {
  visible: boolean;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function FilterModal({ visible, options, selectedId, onSelect, onClose }: FilterModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{ width: '85%', borderRadius: 20, padding: 20, maxHeight: '60%', backgroundColor: theme.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>{t('documents.filter') || 'Filtrar por estado'}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8,
                ...(selectedId === option.id ? { backgroundColor: theme.primary + '15' } : {}),
              }}
              onPress={() => { onSelect(option.id); onClose(); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '500', color: theme.text }}>{option.label}</Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.primary + '20' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary }}>{option.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
