import { useCallback } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';

const LOGO_ANIMATION_DURATION = 700;
const BACKGROUND_ANIMATION_DURATION = 3000;
const LOGO_INITIAL_SCALE = 0.92;
const LOGO_FINAL_SCALE = 1.0;
const BACKGROUND_ZOOM_MAX = 1.05;

export function useLogoAnimation(onComplete?: () => void) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(LOGO_INITIAL_SCALE);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleAnimationEnd = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const startAnimation = useCallback(() => {
    opacity.value = withTiming(1, {
      duration: LOGO_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(LOGO_FINAL_SCALE, {
      duration: LOGO_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(handleAnimationEnd)();
      }
    });
  }, [opacity, scale, handleAnimationEnd]);

  return { animatedStyle, startAnimation };
}

export function useBackgroundAnimation() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startAnimation = () => {
    scale.value = withTiming(BACKGROUND_ZOOM_MAX, {
      duration: BACKGROUND_ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad),
    });
  };

  return { animatedStyle, startAnimation };
}
