import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Trash2, HardDrive } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { documentCache, CachedDocument } from '@/lib/documentCache';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function SavedDocumentsSection() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [docs, setDocs] = useState<CachedDocument[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const cached = await documentCache.listCached();
    setDocs(cached);
    const size = await documentCache.getCacheSize();
    setTotalSize(size);
  };

  const handleRemove = async (docId: string) => {
    await documentCache.remove(docId);
    loadDocs();
  };

  if (docs.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FileText size={20} color={theme.accent} />
        <Text style={styles.title}>Saved Documents</Text>
        <View style={styles.sizeBadge}>
          <HardDrive size={12} color={theme.textSecondary} />
          <Text style={styles.sizeText}>{formatBytes(totalSize)}</Text>
        </View>
      </View>

      {docs.map((doc) => (
        <View key={doc.id} style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
            <Text style={styles.docSize}>{formatBytes(doc.fileSize)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(doc.id)}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    title: { fontSize: 16, fontWeight: '700', color: theme.text, flex: 1 },
    sizeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sizeText: { fontSize: 12, color: theme.textSecondary },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    docInfo: { flex: 1, marginRight: 12 },
    docName: { fontSize: 14, color: theme.text, fontWeight: '500' },
    docSize: { fontSize: 12, color: theme.textSecondary },
  });
}
