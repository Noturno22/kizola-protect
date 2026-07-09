import { View } from 'react-native';
import { Shield, CheckCircle2 } from 'lucide-react-native';

export function GlowingShield({ theme }: { theme: any }) {
  return (
    <View style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: 78, height: 78, borderRadius: 39,
        backgroundColor: theme.shieldGlow,
      }} />
      <Shield size={50} color={theme.accent} strokeWidth={1.4} />
      <View style={{
        position: 'absolute', bottom: 12, right: 12,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: theme.accent,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 8, elevation: 4,
      }}>
        <CheckCircle2 size={14} color="#FFF" strokeWidth={2.5} />
      </View>
    </View>
  );
}
