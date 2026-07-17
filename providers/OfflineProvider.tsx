import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { COLORS } from '@/constants/colors';

import i18n from '@/lib/i18n';

interface OfflineContextValue {
  isConnected: boolean;
}

const OfflineContext = createContext<OfflineContextValue>({ isConnected: true });

export function useOffline(): OfflineContextValue {
  return useContext(OfflineContext);
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isConnected }}>
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
