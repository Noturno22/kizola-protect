import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '@/providers/OfflineProvider';

export function OfflineSyncBadge() {
  const { pendingSyncCount } = useOffline();

  if (pendingSyncCount === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{pendingSyncCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
