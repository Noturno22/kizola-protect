import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, Download, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { LocalDocument, formatDate, getFileIcon, getDocStatusConfig } from './helpers';
import { useTranslation } from 'react-i18next';

interface DocumentCardProps {
  doc: LocalDocument;
  onView: (doc: LocalDocument) => void;
  onDownload: (doc: LocalDocument) => void;
  onDelete: (doc: LocalDocument) => void;
}

export function DocumentCard({ doc, onView, onDownload, onDelete }: DocumentCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const statusCfg = getDocStatusConfig(doc.status, theme, t);
  const StatusIcon = statusCfg.icon;
  const { icon: FileIcon, color: iconColor } = getFileIcon(doc.type);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }}>
      <View style={{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: iconColor + '15' }}>
        <FileIcon size={22} color={iconColor} />
      </View>

      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 6, color: theme.text }} numberOfLines={1}>
          {doc.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 12, color: theme.textMuted }}>{doc.sizeFormatted}</Text>
          <Text style={{ fontSize: 12, color: theme.textMuted }}>• {formatDate(doc.date)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: statusCfg.bg }}>
            <StatusIcon size={12} color={statusCfg.color} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: statusCfg.color }}>{statusCfg.label}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.primary + '15' }} onPress={() => onView(doc)}>
          <Eye size={18} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.success + '15' }} onPress={() => onDownload(doc)}>
          <Download size={18} color={theme.success} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.error + '15' }} onPress={() => onDelete(doc)}>
          <Trash2 size={18} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
