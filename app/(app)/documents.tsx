import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Upload, RefreshCw, Search, X, Filter, FolderOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
import {
  LocalDocument,
  formatFileSize,
  StatsRow,
  DocumentCard,
  UploadMenuModal,
  FilterModal,
  PreviewModal,
} from '@/components/documents';

const isSharingAvailable = typeof Sharing.shareAsync === 'function';

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
      if (raw) setDocuments(raw);
      else setDocuments([]);
    } catch (e) {
      console.error('Error loading documents:', e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemoMode]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const processFile = async (uri: string, name: string, size: number, mimeType: string) => {
    if (!user?.id) return;
    setUploading(true);
    try {
      if (!isDemoMode && isSupabaseConfigured()) {
        const fileExt = name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const decoded = Buffer.from(fileContent, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, decoded, { contentType: mimeType || 'image/jpeg', upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('documents').insert({
          user_id: user.id, name, file_path: filePath,
          file_url: publicUrl.publicUrl, file_type: mimeType || `image/${fileExt}`,
          file_size: size, status: 'pending',
        });
        if (dbError) throw dbError;
      } else {
        const newDoc: LocalDocument = {
          id: `demo-${Date.now()}`, name, type: mimeType || 'image/jpeg', size,
          sizeFormatted: formatFileSize(size), date: new Date().toISOString(), status: 'pending', uri,
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
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      await processFile(asset.uri, asset.fileName || 'foto.jpg', asset.fileSize || 0, asset.mimeType || 'image/jpeg');
    }
  };

  const handleDeleteDocument = (doc: LocalDocument) => {
    Alert.alert(
      t('documents.deleteConfirm') || 'Eliminar Documento',
      `${t('documents.deleteConfirmMessage') || 'Tem a certeza que deseja eliminar'} "${doc.name}"?`,
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('common.delete') || 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              if (!isDemoMode && isSupabaseConfigured() && doc.filePath) {
                await supabase.storage.from('documents').remove([doc.filePath]);
                await supabase.from('documents').delete().eq('id', doc.id);
              } else {
                const updated = documents.filter(d => d.id !== doc.id);
                if (user?.id) await setSecureItem(SECURE_KEYS.DOCUMENTS(user.id), updated);
                setDocuments(updated);
              }
              loadDocuments();
            } catch (error: any) {
              Alert.alert(t('common.error') || 'Erro', error.message || 'Falha ao eliminar');
            }
          },
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
        const { data, error } = await supabase.storage.from('documents').download(doc.filePath);
        if (error) throw error;
        const cacheDir = (FileSystem as any).cacheDirectory;
        fileUri = `${cacheDir}${doc.name}`;
        await FileSystem.writeAsStringAsync(fileUri, Buffer.from(await data.arrayBuffer()).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
      }
      if (fileUri) {
        if (isSharingAvailable) await Sharing.shareAsync(fileUri, { mimeType: doc.type });
        else Alert.alert(t('common.info') || 'Info', t('documents.sharingNotAvailable') || 'Visualização não disponível neste dispositivo');
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
        const { data, error } = await supabase.storage.from('documents').download(doc.filePath);
        if (error) throw error;
        const cacheDir = (FileSystem as any).cacheDirectory;
        fileUri = `${cacheDir}${doc.name}`;
        await FileSystem.writeAsStringAsync(fileUri, Buffer.from(await data.arrayBuffer()).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
      }
      if (fileUri) {
        if (isSharingAvailable) await Sharing.shareAsync(fileUri, { mimeType: doc.type });
        else Alert.alert(t('common.info') || 'Info', t('documents.sharingNotAvailable') || 'Download não disponível neste dispositivo');
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

  const filterOptions = [
    { id: 'all', label: t('documents.all') || 'Todos', count: documents.length },
    { id: 'verified', label: t('documents.verified') || 'Verificados', count: stats.verified },
    { id: 'pending', label: t('documents.pending') || 'Pendentes', count: stats.pending },
    { id: 'rejected', label: t('documents.rejected') || 'Rejeitados', count: stats.rejected },
  ];

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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

          {/* Stats */}
          <StatsRow total={stats.total} verified={stats.verified} pending={stats.pending} rejected={stats.rejected} />

          {/* Search & Filter */}
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
            onPress={() => setUploadMenuVisible(true)}
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
              {filteredDocuments.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        <UploadMenuModal
          visible={uploadMenuVisible}
          onClose={() => setUploadMenuVisible(false)}
          onPickFromGallery={handlePickFromGallery}
          onTakePhoto={handleTakePhoto}
        />
        <FilterModal
          visible={showFilterModal}
          options={filterOptions}
          selectedId={filterStatus}
          onSelect={setFilterStatus}
          onClose={() => setShowFilterModal(false)}
        />
        <PreviewModal
          doc={previewDoc}
          loading={previewLoading}
          onView={() => previewDoc && handleViewDocument(previewDoc)}
          onDownload={() => previewDoc && handleDownloadDocument(previewDoc)}
          onClose={() => setPreviewDoc(null)}
        />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
    scrollContent: { flexGrow: 1, paddingBottom: 32 },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    },
    headerTitle: { fontSize: 28, fontWeight: '700', color: theme.isDark ? '#FFFFFF' : theme.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 15, color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary },
    refreshButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    rotating: { transform: [{ rotate: '360deg' }] },
    searchBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
    searchInputContainer: {
      flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
      borderRadius: 12, gap: 10, borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 15, color: theme.text },
    filterButton: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    uploadButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      marginHorizontal: 20, paddingVertical: 14, borderRadius: 14, marginBottom: 20,
    },
    uploadButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    loadingContainer: { alignItems: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 12, fontSize: 14 },
    documentsList: { paddingHorizontal: 20, gap: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
    emptyIcon: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
    emptyDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  });
