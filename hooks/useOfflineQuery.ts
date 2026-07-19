import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineCache } from '@/lib/offlineCache';

interface UseOfflineQueryOptions {
  cacheTtl?: number; // seconds
}

interface UseOfflineQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isFromCache: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOfflineQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: UseOfflineQueryOptions
): UseOfflineQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (offlineCache.isConnected) {
        // Online: fetch fresh data and cache it
        const result = await fetchFn();
        if (mountedRef.current) {
          setData(result);
          setIsFromCache(false);
        }
        await offlineCache.set(key, result, options?.cacheTtl ?? 3600);
      } else {
        // Offline: read from cache
        const cached = await offlineCache.get<T>(key);
        if (mountedRef.current) {
          if (cached !== null) {
            setData(cached);
            setIsFromCache(true);
          } else {
            setError(new Error('No cached data available offline'));
          }
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        // Try cache as fallback on error
        const cached = await offlineCache.get<T>(key);
        if (cached !== null) {
          setData(cached);
          setIsFromCache(true);
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [key, fetchFn, options?.cacheTtl]);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return { data, isLoading, isFromCache, error, refetch: execute };
}
