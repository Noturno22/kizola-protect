import { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { SplashBackground } from './SplashBackground';

const FADE_OUT_DURATION = 400;

interface SplashScreenProps {
  readyToDismiss: boolean;
  onAnimationComplete: () => void;
}

export function SplashScreen({
  readyToDismiss,
  onAnimationComplete,
}: SplashScreenProps) {
  const opacity = useSharedValue(1);
  const hasFadedOut = useRef(false);

  useEffect(() => {
    if (!readyToDismiss || hasFadedOut.current) return;

    hasFadedOut.current = true;

    opacity.value = withTiming(0, {
      duration: FADE_OUT_DURATION,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [readyToDismiss, opacity, onAnimationComplete]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0D1B2E' }, animatedContainerStyle]}>
      <SplashBackground />
    </Animated.View>
  );
}
