import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

type Props = {
  theme: any;
};

export function Marquee({ theme }: Props) {
  const { t } = useTranslation();
  const motto = t('dashboard.motto') || 'Protecting your journey · Your rights, our mission · Stronger together · ';
  const text = motto.repeat(3);

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-1200, {
        duration: 30000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { borderTopColor: theme.cardBorderAlt }]}>
      <View style={styles.mask}>
        <Animated.Text
          style={[
            styles.text,
            {
              color: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
            },
            animatedStyle,
          ]}
          numberOfLines={1}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  mask: {
    overflow: 'hidden',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    width: 3600,
  },
});

export default Marquee;
