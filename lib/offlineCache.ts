import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const CACHE_PREFIX = 'kizola_cache_';
const DEFAULT_TTL = 3600; // 1 hour in seconds

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class OfflineCacheManager {
  isConnected = true;
  private listeners: Array<(connected: boolean) => void> = [];
  private unsubscribe: (() => void) | null = null;

  async init(): Promise<void> {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? true;

    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? true;
      if (wasConnected !== this.isConnected) {
        this.listeners.forEach((fn) => fn(this.isConnected));
      }
    });
  }

  destroy(): void {
    this.unsubscribe?.();
    this.listeners = [];
  }

  onStatusChange(callback: (connected: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.value;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  }

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  }
}

export const offlineCache = new OfflineCacheManager();
