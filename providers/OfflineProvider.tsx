import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { COLORS } from '@/constants/colors';
import i18n from '@/lib/i18n';
import { offlineCache } from '@/lib/offlineCache';
import { syncQueue } from '@/lib/syncQueue';

interface OfflineContextValue {
  isConnected: boolean;
  pendingSyncCount: number;
  refreshPendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue>({
  isConnected: true,
  pendingSyncCount: 0,
  refreshPendingCount: async () => {},
});

export function useOffline(): OfflineContextValue {
  return useContext(OfflineContext);
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await syncQueue.getPendingCount();
    setPendingSyncCount(count);
  }, []);

  useEffect(() => {
    offlineCache.init();
    syncQueue.init().then(refreshPendingCount);

    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      offlineCache.isConnected = connected;

      if (connected) {
        const result = await syncQueue.syncAll();
        if (result.synced > 0 || result.failed > 0) {
          refreshPendingCount();
        }
      }
    });

    return () => {
      unsubscribe();
      offlineCache.destroy();
    };
  }, [refreshPendingCount]);

  return (
    <OfflineContext.Provider value={{ isConnected, pendingSyncCount, refreshPendingCount }}>
      {children}
      {!isConnected && <OfflineBanner accessibilityLabel="You are offline" />}
    </OfflineContext.Provider>
  );
}

function OfflineBanner({ accessibilityLabel }: { accessibilityLabel: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.banner, { top: insets.top }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="alert"
      accessible
    >
      <Text style={styles.text}>
        {i18n.t('offline.banner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
