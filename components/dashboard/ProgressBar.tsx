import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ProgressBar({ value, color, theme }: { value: number; color: string; theme: any }) {
  return (
    <View style={{ height: 4, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
      <LinearGradient
        colors={[color, color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: '100%', width: `${value}%`, borderRadius: 4 }}
      />
    </View>
  );
}
