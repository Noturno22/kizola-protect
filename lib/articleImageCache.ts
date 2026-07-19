import { Paths, File, Directory } from 'expo-file-system';

const CACHE_DIR_NAME = 'article-images';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

class ArticleImageCache {
  private getCacheDir = (): Directory => {
    return new Directory(Paths.document, CACHE_DIR_NAME);
  };

  private ensureDir = (): void => {
    const dir = this.getCacheDir();
    if (!dir.exists) {
      dir.create();
    }
  };

  private uriToFilename = (uri: string): string => {
    const hash = uri.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
    return hash + '.jpg';
  };

  async cacheImage(uri: string): Promise<string> {
    this.ensureDir();
    const filename = this.uriToFilename(uri);
    const dest = new File(Paths.document, CACHE_DIR_NAME, filename);

    if (dest.exists) return dest.uri;

    const downloaded = await File.downloadFileAsync(uri, this.getCacheDir());
    return downloaded.uri;
  }

  async getLocalPath(uri: string): Promise<string | null> {
    const filename = this.uriToFilename(uri);
    const file = new File(Paths.document, CACHE_DIR_NAME, filename);
    return file.exists ? file.uri : null;
  }

  async clearOldImages(maxAgeMs = MAX_AGE_MS): Promise<void> {
    this.ensureDir();
    const dir = this.getCacheDir();
    const items = dir.list();
    const now = Date.now();

    for (const item of items) {
      if (item instanceof File) {
        const info = item.info();
        if (info.exists && info.modificationTime) {
          const age = now - info.modificationTime * 1000;
          if (age > maxAgeMs) {
            item.delete();
          }
        }
      }
    }
  }

  async getCacheSize(): Promise<number> {
    this.ensureDir();
    const dir = this.getCacheDir();
    const items = dir.list();
    let total = 0;
    for (const item of items) {
      if (item instanceof File) {
        const info = item.info();
        if (info.exists && info.size) {
          total += info.size;
        }
      }
    }
    return total;
  }
}

export const articleImageCache = new ArticleImageCache();
