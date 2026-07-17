import { memo, useCallback } from 'react';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { useLogoAnimation } from './animations';
import { styles } from './styles';

const LOGO_SOURCE = require('@/assets/images/splash-icon.png');

interface SplashLogoProps {
  onAnimationComplete?: () => void;
}

export const SplashLogo = memo(function SplashLogo({
  onAnimationComplete,
}: SplashLogoProps) {
  const { animatedStyle, startAnimation } = useLogoAnimation(onAnimationComplete);

  const handleLoadEnd = useCallback(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <Image
        source={LOGO_SOURCE}
        style={styles.logo}
        contentFit="contain"
        onLoadEnd={handleLoadEnd}
        priority="high"
      />
    </Animated.View>
  );
});
