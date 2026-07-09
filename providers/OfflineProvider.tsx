import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { colors } from '@/constants/colors';

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
  return (
    <View
      style={styles.banner}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="alert"
      accessible
    >
      <Text style={styles.text}>
        You are offline. Some features may be unavailable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
