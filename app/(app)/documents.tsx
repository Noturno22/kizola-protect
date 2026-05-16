import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  Upload,
  FolderOpen,
  File,
  FileCheck,
  Clock
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'uploaded' | 'pending' | 'verified';
}

export default function Documents() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Apólice de Seguro.pdf',
      type: 'pdf',
      size: '2.4 MB',
      date: '2026-04-15',
      status: 'verified'
    },
    {
      id: '2',
      name: 'Comprovativo de Pagamento.pdf',
      type: 'pdf',
      size: '1.1 MB',
      date: '2026-03-20',
      status: 'verified'
    },
    {
      id: '3',
      name: 'Declaração de IRS_2025.pdf',
      type: 'pdf',
      size: '3.8 MB',
      date: '2026-02-10',
      status: 'pending'
    }
  ]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return { 
          color: theme.success, 
          bg: theme.success + '15', 
          icon: FileCheck,
          label: t('documents.verified') || 'Verificado'
        };
      case 'pending':
        return { 
          color: '#F59E0B', 
          bg: 'rgba(245,158,11,0.15)', 
          icon: Clock,
          label: t('documents.pending') || 'Pendente'
        };
      default:
        return { 
          color: theme.textMuted, 
          bg: theme.background, 
          icon: File,
          label: t('documents.uploaded') || 'Carregado'
        };
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText size={24} color={theme.primary} />;
  };

  const handleViewDocument = (doc: Document) => {
    Alert.alert(
      doc.name,
      `${t('documents.size') || 'Tamanho'}: ${doc.size}\n${t('documents.date') || 'Data'}: ${doc.date}`,
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        { text: t('documents.view') || 'Ver', onPress: () => {} },
      ]
    );
  };

  const handleDeleteDocument = (doc: Document) => {
    Alert.alert(
      t('documents.deleteConfirm') || 'Eliminar Documento',
      `${t('documents.deleteConfirmMessage') || 'Tem a certeza que deseja eliminar'} "${doc.name}"?`,
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        { 
          text: t('common.delete') || 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setDocuments(documents.filter(d => d.id !== doc.id));
          }
        },
      ]
    );
  };

  const handleUploadDocument = () => {
    Alert.alert(
      t('documents.uploadTitle') || 'Carregar Documento',
      t('documents.uploadMessage') || 'Funcionalidade de uploadcoming soon',
      [{ text: t('common.ok') || 'OK' }]
    );
  };

  const stats = useMemo(() => ({
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
  }), [documents]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.headerTitle}>{t('documents.title') || 'Meus Documentos'}</Text>
          <Text style={styles.headerSubtitle}>{t('documents.subtitle') || 'Gerencie seus documentos'}</Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.total') || 'Total'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>{stats.verified}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.verified') || 'Verificados'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.pending') || 'Pendentes'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.uploadButton, { backgroundColor: theme.primary }]}
          onPress={handleUploadDocument}
        >
          <Upload size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>{t('documents.uploadNew') || 'Carregar Novo Documento'}</Text>
        </TouchableOpacity>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <FolderOpen size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('documents.empty') || 'Nenhum documento'}</Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              {t('documents.emptyMessage') || 'Carregue seus documentos para ter acesso rápido'}
            </Text>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {documents.map((doc) => {
              const statusCfg = getStatusConfig(doc.status);
              const StatusIcon = statusCfg.icon;
              
              return (
                <View key={doc.id} style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                  <View style={[styles.documentIcon, { backgroundColor: theme.primary + '15' }]}>
                    {getFileIcon(doc.type)}
                  </View>
                  
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentName, { color: theme.text }]} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <View style={styles.documentMeta}>
                      <Text style={[styles.documentSize, { color: theme.textMuted }]}>{doc.size}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <StatusIcon size={12} color={statusCfg.color} />
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.documentActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
                      onPress={() => handleViewDocument(doc)}
                    >
                      <Eye size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.error + '15' }]}
                      onPress={() => handleDeleteDocument(doc)}
                    >
                      <Trash2 size={18} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -24,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  documentsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  documentSize: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});