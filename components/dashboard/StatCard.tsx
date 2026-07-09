import { View, Text } from 'react-native';

export function StatCard({ value, label, color, theme }: { value: string; label: string; color: string; bg: string; theme: any }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.statCardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      padding: 14,
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color, letterSpacing: -0.5, marginBottom: 3 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}
