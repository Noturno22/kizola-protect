import { Paths, File, Directory } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOCS_DIR_NAME = 'documents';
const METADATA_KEY = 'kizola_document_cache_meta';

export interface CachedDocument {
  id: string;
  name: string;
  localPath: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  cachedAt: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

class DocumentCache {
  private getDocsDir = (): Directory => {
    return new Directory(Paths.document, DOCS_DIR_NAME);
  };

  private ensureDir = (): void => {
    const dir = this.getDocsDir();
    if (!dir.exists) {
      dir.create();
    }
  };

  private loadMeta = async (): Promise<CachedDocument[]> => {
    const raw = await AsyncStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  private saveMeta = async (items: CachedDocument[]) => {
    await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(items));
  };

  async download(doc: DocumentMeta): Promise<string> {
    this.ensureDir();
    const filename = `${doc.id}_${doc.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const file = new File(Paths.document, DOCS_DIR_NAME, filename);

    if (file.exists) return file.uri;

    await File.downloadFileAsync(doc.file_url, this.getDocsDir());

    const cached: CachedDocument = {
      id: doc.id,
      name: doc.name,
      localPath: file.uri,
      originalUrl: doc.file_url,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      cachedAt: new Date().toISOString(),
    };

    const meta = await this.loadMeta();
    meta.push(cached);
    await this.saveMeta(meta);

    return file.uri;
  }

  async getLocalPath(docId: string): Promise<string | null> {
    const meta = await this.loadMeta();
    const doc = meta.find((d) => d.id === docId);
    if (!doc) return null;

    const file = new File(doc.localPath);
    return file.exists ? doc.localPath : null;
  }

  async listCached(): Promise<CachedDocument[]> {
    const meta = await this.loadMeta();
    const existing: CachedDocument[] = [];
    for (const doc of meta) {
      const file = new File(doc.localPath);
      if (file.exists) existing.push(doc);
    }
    return existing;
  }

  async remove(docId: string): Promise<void> {
    const meta = await this.loadMeta();
    const doc = meta.find((d) => d.id === docId);
    if (doc) {
      const file = new File(doc.localPath);
      if (file.exists) file.delete();
    }
    const updated = meta.filter((d) => d.id !== docId);
    await this.saveMeta(updated);
  }

  async getCacheSize(): Promise<number> {
    const meta = await this.loadMeta();
    let total = 0;
    for (const doc of meta) {
      const file = new File(doc.localPath);
      if (file.exists) {
        const info = file.info();
        if (info.size) total += info.size;
      }
    }
    return total;
  }

  async enforceMaxSize(maxBytes: number): Promise<void> {
    const meta = await this.loadMeta();
    let total = 0;
    const toRemove: string[] = [];

    const sorted = [...meta].sort(
      (a, b) => new Date(a.cachedAt).getTime() - new Date(b.cachedAt).getTime()
    );

    for (const doc of sorted) {
      const file = new File(doc.localPath);
      if (file.exists) {
        const info = file.info();
        if (info.size) {
          total += info.size;
          if (total > maxBytes) {
            toRemove.push(doc.id);
          }
        }
      }
    }

    for (const id of toRemove) {
      await this.remove(id);
    }
  }
}

export const documentCache = new DocumentCache();
