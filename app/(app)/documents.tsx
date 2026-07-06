import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const isSharingAvailable = typeof Sharing.shareAsync === 'function';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  FolderOpen,
  File,
  FileCheck,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Image as ImageIcon,
  FileSpreadsheet,
  Archive,
  Camera
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';

interface LocalDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeFormatted: string;
  date: string;
  status: 'uploaded' | 'pending' | 'verified' | 'rejected';
  uri?: string;
  filePath?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFileIcon(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes('pdf')) return { icon: FileText, color: '#EF4444' };
  if (lower.includes('image') || lower.includes('png') || lower.includes('jpg') || lower.includes('jpeg') || lower.includes('gif') || lower.includes('webp')) return { icon: ImageIcon, color: '#10B981' };
  if (lower.includes('sheet') || lower.includes('excel') || lower.includes('csv') || lower.includes('xls')) return { icon: FileSpreadsheet, color: '#10B981' };
  if (lower.includes('zip') || lower.includes('rar') || lower.includes('tar') || lower.includes('7z')) return { icon: Archive, color: '#F59E0B' };
  return { icon: File, color: '#6366F1' };
}

export default function Documents() {
  const { user, isDemoMode } = useAuth();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LocalDocument | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadMenuVisible, setUploadMenuVisible] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (!isDemoMode && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: LocalDocument[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            type: d.file_type,
            size: d.file_size,
            sizeFormatted: formatFileSize(d.file_size),
            date: d.created_at,
            status: d.status,
            filePath: d.file_path,
          }));
          setDocuments(mapped);
          return;
        }
      }

      const raw = await getSecureItem<LocalDocument[]>(SECURE_KEYS.DOCUMENTS(user.id));
      if (raw) {
        setDocuments(raw);
      } else {
        setDocuments([]);
      }
    } catch (e) {
      console.error('Error loading documents:', e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemoMode]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const processFile = async (uri: string, name: string, size: number, mimeType: string) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      if (!isDemoMode && isSupabaseConfigured()) {
        const fileExt = name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const fileContent = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const decoded = Buffer.from(fileContent, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, decoded, {
            contentType: mimeType || 'image/jpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('documents').insert({
          user_id: user.id,
          name,
          file_path: filePath,
          file_url: publicUrl.publicUrl,
          file_type: mimeType || `image/${fileExt}`,
          file_size: size,
          status: 'pending',
        });

        if (dbError) throw dbError;
      } else {
        const newDoc: LocalDocument = {
          id: `demo-${Date.now()}`,
          name,
          type: mimeType || 'image/jpeg',
          size,
          sizeFormatted: formatFileSize(size),
          date: new Date().toISOString(),
          status: 'pending',
          uri,
        };
        const updated = [newDoc, ...documents];
        await setSecureItem(SECURE_KEYS.DOCUMENTS(user.id), updated);
        setDocuments(updated);
      }

      Alert.alert(t('common.success') || 'Sucesso', t('documents.uploadSuccess') || 'Documento carregado com sucesso');
      loadDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(t('common.error') || 'Erro', error.message || t('documents.uploadError') || 'Falha ao carregar documento');
    } finally {
      setUploading(false);
    }
  };

  const handlePickFromGallery = async () => {
    setUploadMenuVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('documents.permissionDenied') || 'Permissão negada', t('documents.permissionMessage') || 'É necessário acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await processFile(asset.uri, asset.fileName || 'imagem.jpg', asset.fileSize || 0, asset.mimeType || 'image/jpeg');
    }
  };

  const handleTakePhoto = async () => {
    setUploadMenuVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('documents.permissionDenied') || 'Permissão negada', t('documents.cameraPermissionMessage') || 'É necessário acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await processFile(asset.uri, asset.fileName || 'foto.jpg', asset.fileSize || 0, asset.mimeType || 'image/jpeg');
    }
  };

  const handleUploadDocument = () => {
    setUploadMenuVisible(true);
  };

  const handleDeleteDocument = (doc: LocalDocument) => {
    Alert.alert(
      t('documents.deleteConfirm') || 'Eliminar Documento',
      `${t('documents.deleteConfirmMessage') || 'Tem a certeza que deseja eliminar'} "${doc.name}"?`,
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('common.delete') || 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isDemoMode && isSupabaseConfigured() && doc.filePath) {
                await supabase.storage.from('documents').remove([doc.filePath]);
                await supabase.from('documents').delete().eq('id', doc.id);
              } else {
                const updated = documents.filter(d => d.id !== doc.id);
                if (user?.id) {
        await setSecureItem(SECURE_KEYS.DOCUMENTS(user.id), updated);
                }
                setDocuments(updated);
              }
              loadDocuments();
            } catch (error: any) {
              Alert.alert(t('common.error') || 'Erro', error.message || 'Falha ao eliminar');
            }
          }
        },
      ]
    );
  };

  const handleViewDocument = async (doc: LocalDocument) => {
    setPreviewDoc(doc);
    setPreviewLoading(true);

    try {
      let fileUri = doc.uri;

      if (!isDemoMode && isSupabaseConfigured() && doc.filePath && !fileUri) {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(doc.filePath);

        if (error) throw error;

        const cacheDir = FileSystem.cacheDirectory;
        fileUri = `${cacheDir}${doc.name}`;
        await FileSystem.writeAsStringAsync(fileUri, Buffer.from(await data.arrayBuffer()).toString('base64'), {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (fileUri) {
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileUri, { mimeType: doc.type });
        } else {
          Alert.alert(t('common.info') || 'Info', t('documents.sharingNotAvailable') || 'Visualização não disponível neste dispositivo');
        }
      }
    } catch (error: any) {
      Alert.alert(t('common.error') || 'Erro', error.message || 'Não foi possível abrir o documento');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: LocalDocument) => {
    try {
      let fileUri = doc.uri;

      if (!isDemoMode && isSupabaseConfigured() && doc.filePath && !fileUri) {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(doc.filePath);

        if (error) throw error;

        const cacheDir = FileSystem.cacheDirectory;
        fileUri = `${cacheDir}${doc.name}`;
        await FileSystem.writeAsStringAsync(fileUri, Buffer.from(await data.arrayBuffer()).toString('base64'), {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (fileUri) {
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileUri, { mimeType: doc.type });
        } else {
          Alert.alert(t('common.info') || 'Info', t('documents.sharingNotAvailable') || 'Download não disponível neste dispositivo');
        }
      }
    } catch (error: any) {
      Alert.alert(t('common.error') || 'Erro', error.message || 'Falha ao descarregar');
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  }), [documents]);

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
      case 'rejected':
        return {
          color: theme.error,
          bg: theme.error + '15',
          icon: AlertCircle,
          label: t('documents.rejected') || 'Rejeitado'
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

  const filterOptions = [
    { id: 'all', label: t('documents.all') || 'Todos', count: documents.length },
    { id: 'verified', label: t('documents.verified') || 'Verificados', count: stats.verified },
    { id: 'pending', label: t('documents.pending') || 'Pendentes', count: stats.pending },
    { id: 'rejected', label: t('documents.rejected') || 'Rejeitados', count: stats.rejected },
  ];

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={theme.headerGradient} style={styles.headerGradient} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t('documents.title') || 'Meus Documentos'}</Text>
              <Text style={styles.headerSubtitle}>{t('documents.subtitle') || 'Gerencie seus documentos'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: theme.surface + '80' }]}
              onPress={loadDocuments}
              disabled={loading}
            >
              <RefreshCw size={20} color={theme.primary} style={loading && styles.rotating} />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <View style={[styles.statIconBg, { backgroundColor: theme.primary + '15' }]}>
                <FolderOpen size={20} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.primary }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.total') || 'Total'}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <View style={[styles.statIconBg, { backgroundColor: theme.success + '15' }]}>
                <FileCheck size={20} color={theme.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.success }]}>{stats.verified}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.verified') || 'Verificados'}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#F59E0B15' }]}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.pending') || 'Pendentes'}</Text>
            </View>
            {stats.rejected > 0 && (
              <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                <View style={[styles.statIconBg, { backgroundColor: theme.error + '15' }]}>
                  <AlertCircle size={20} color={theme.error} />
                </View>
                <Text style={[styles.statValue, { color: theme.error }]}>{stats.rejected}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('documents.rejected') || 'Rejeitados'}</Text>
              </View>
            )}
          </ScrollView>

          {/* Search & Filter Bar */}
          <View style={styles.searchBar}>
            <View style={[styles.searchInputContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <Search size={18} color={theme.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('documents.search') || 'Pesquisar documentos...'}
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, borderWidth: 1 }]}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={18} color={filterStatus !== 'all' ? theme.primary : theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={handleUploadDocument}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Upload size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>{t('documents.uploadNew') || 'Carregar Novo Documento'}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Upload Menu Modal */}
          <Modal
            visible={uploadMenuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setUploadMenuVisible(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setUploadMenuVisible(false)}>
              <View style={[styles.uploadMenuContent, { backgroundColor: theme.surface }]}>
                <Text style={[styles.uploadMenuTitle, { color: theme.text }]}>{t('documents.chooseSource') || 'Escolher origem'}</Text>
                <TouchableOpacity
                  style={[styles.uploadMenuOption, { borderBottomColor: theme.cardBorderAlt }]}
                  onPress={handlePickFromGallery}
                >
                  <View style={[styles.uploadMenuIcon, { backgroundColor: theme.primary + '15' }]}>
                    <FolderOpen size={22} color={theme.primary} />
                  </View>
                  <Text style={[styles.uploadMenuOptionText, { color: theme.text }]}>{t('documents.gallery') || 'Galeria'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadMenuOption}
                  onPress={handleTakePhoto}
                >
                  <View style={[styles.uploadMenuIcon, { backgroundColor: theme.success + '15' }]}>
                    <Camera size={22} color={theme.success} />
                  </View>
                  <Text style={[styles.uploadMenuOptionText, { color: theme.text }]}>{t('documents.camera') || 'Câmera'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Documents List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>{t('documents.loading') || 'A carregar documentos...'}</Text>
            </View>
          ) : filteredDocuments.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
                <FolderOpen size={48} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('documents.empty') || 'Nenhum documento'}</Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                {searchQuery
                  ? (t('documents.noSearchResults') || 'Nenhum documento encontrado para esta pesquisa')
                  : (t('documents.emptyMessage') || 'Carregue seus documentos para ter acesso rápido')
                }
              </Text>
            </View>
          ) : (
            <View style={styles.documentsList}>
              {filteredDocuments.map((doc) => {
                const statusCfg = getStatusConfig(doc.status);
                const StatusIcon = statusCfg.icon;
                const { icon: FileIcon, color: iconColor } = getFileIcon(doc.type);

                return (
                  <View key={doc.id} style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                    <View style={[styles.documentIcon, { backgroundColor: iconColor + '15' }]}>
                      <FileIcon size={22} color={iconColor} />
                    </View>

                    <View style={styles.documentInfo}>
                      <Text style={[styles.documentName, { color: theme.text }]} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <View style={styles.documentMeta}>
                        <Text style={[styles.documentSize, { color: theme.textMuted }]}>{doc.sizeFormatted}</Text>
                        <Text style={[styles.documentDate, { color: theme.textMuted }]}>• {formatDate(doc.date)}</Text>
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
                        style={[styles.actionButton, { backgroundColor: theme.success + '15' }]}
                        onPress={() => handleDownloadDocument(doc)}
                      >
                        <Download size={18} color={theme.success} />
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

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
            <View style={[styles.filterModalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.filterModalHeader}>
                <Text style={[styles.filterModalTitle, { color: theme.text }]}>{t('documents.filter') || 'Filtrar por estado'}</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    filterStatus === option.id && { backgroundColor: theme.primary + '15' }
                  ]}
                  onPress={() => {
                    setFilterStatus(option.id);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[styles.filterOptionText, { color: theme.text }]}>
                    {option.label}
                  </Text>
                  <View style={[styles.filterCount, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.filterCountText, { color: theme.primary }]}>{option.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Preview Modal */}
        <Modal
          visible={!!previewDoc}
          transparent
          animationType="slide"
          onRequestClose={() => setPreviewDoc(null)}
        >
          <View style={[styles.previewModalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={[styles.previewModalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
                  {previewDoc?.name}
                </Text>
                <TouchableOpacity onPress={() => setPreviewDoc(null)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {previewLoading ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.previewLoadingText, { color: theme.textMuted }]}>
                    {t('documents.opening') || 'A abrir documento...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[styles.previewActionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => previewDoc && handleViewDocument(previewDoc)}
                  >
                    <Eye size={20} color="#FFFFFF" />
                    <Text style={styles.previewActionText}>{t('documents.view') || 'Ver'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewActionBtn, { backgroundColor: theme.success }]}
                    onPress={() => previewDoc && handleDownloadDocument(previewDoc)}
                  >
                    <Download size={20} color="#FFFFFF" />
                    <Text style={styles.previewActionText}>{t('documents.download') || 'Descarregar'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: 110,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  documentsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
    marginRight: 8,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  documentSize: {
    fontSize: 12,
  },
  documentDate: {
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
    gap: 6,
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
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
  },
  previewLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  previewLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  previewActions: {
    gap: 12,
  },
  previewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  previewActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadMenuContent: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
  },
  uploadMenuTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  uploadMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  uploadMenuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
