import { memo } from 'react';
import { Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { useBackgroundAnimation } from './animations';
import { styles } from './styles';

const BACKGROUND_SOURCE = require('@/assets/images/splash-background.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashBackgroundProps {
  onAnimationStart?: () => void;
}

export const SplashBackground = memo(function SplashBackground({
  onAnimationStart,
}: SplashBackgroundProps) {
  const { animatedStyle, startAnimation } = useBackgroundAnimation();

  const handleLoadEnd = () => {
    startAnimation();
    onAnimationStart?.();
  };

  return (
    <Animated.View style={[styles.backgroundContainer, animatedStyle]}>
      <Image
        source={BACKGROUND_SOURCE}
        style={styles.background}
        contentFit="cover"
        onLoadEnd={handleLoadEnd}
        priority="high"
        cachePolicy="memory-disk"
      />
    </Animated.View>
  );
});
