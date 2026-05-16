import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { LogoColors } from '@/constants/logo-colors';

interface KizolaLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function KizolaLogo({
  size = 'medium',
  showText = true,
  variant = 'light'
}: KizolaLogoProps) {
  const { theme } = useTheme();
  const dimensions = {
    small: { shield: 40, fontSize: 16 },
    medium: { shield: 80, fontSize: 28 },
    large: { shield: 120, fontSize: 42 },
  };

  const { shield, fontSize } = dimensions[size];
  const textColor = variant === 'light' ? '#FFFFFF' : LogoColors.darkText;

  return (
    <View style={styles.container}>
      <View style={[styles.shieldContainer, { width: shield, height: shield }]}>
        <Svg width={shield} height={shield} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={LogoColors.blue} />
              <Stop offset="100%" stopColor={LogoColors.blueLight} />
            </LinearGradient>
            <LinearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={LogoColors.green} />
              <Stop offset="100%" stopColor={LogoColors.greenLight} />
            </LinearGradient>
          </Defs>

          <Path
            d="M50 5 L90 15 L90 45 Q90 75 50 95 Q10 75 10 45 L10 15 Z"
            fill="none"
            stroke={LogoColors.blue}
            strokeWidth="3"
          />

          <Path
            d="M50 5 L50 95 Q25 80 20 50 Q18 35 20 15 Z"
            fill="url(#blueGradient)"
            opacity="0.9"
          />

          <Path
            d="M50 5 L50 95 Q75 80 80 50 Q82 35 80 15 Z"
            fill="url(#greenGradient)"
            opacity="0.9"
          />

          <Circle cx="35" cy="30" r="10" fill={LogoColors.blueLight} opacity="0.8" />
          <Circle cx="65" cy="30" r="10" fill={LogoColors.greenLight} opacity="0.8" />
          <Circle cx="50" cy="45" r="8" fill={LogoColors.green} opacity="0.6" />

          <Path
            d="M25 55 Q35 50 45 60 L45 85 Q35 80 25 70 Z"
            fill={LogoColors.blue}
            opacity="0.7"
          />
          <Path
            d="M75 55 Q65 50 55 60 L55 85 Q65 80 75 70 Z"
            fill={LogoColors.green}
            opacity="0.7"
          />
        </Svg>
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, { fontSize, color: textColor }]}>
            KIZOLA
          </Text>
          <Text style={[styles.brandTagline, { color: variant === 'light' ? 'rgba(255,255,255,0.9)' : theme.textSecondary }]}>
            PROTECT
          </Text>
        </View>
      )}
    </View>
  );
}

export function KizolaLogoSimple({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={LogoColors.blue} />
          <Stop offset="100%" stopColor={LogoColors.blueLight} />
        </LinearGradient>
        <LinearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={LogoColors.green} />
          <Stop offset="100%" stopColor={LogoColors.greenLight} />
        </LinearGradient>
      </Defs>

      <Path
        d="M50 5 L50 95 Q25 80 20 50 Q18 35 20 15 Z"
        fill="url(#blueGrad)"
        opacity="0.9"
      />
      <Path
        d="M50 5 L50 95 Q75 80 80 50 Q82 35 80 15 Z"
        fill="url(#greenGrad)"
        opacity="0.9"
      />

      <Circle cx="35" cy="30" r="10" fill={LogoColors.blueLight} opacity="0.9" />
      <Circle cx="65" cy="30" r="10" fill={LogoColors.greenLight} opacity="0.9" />
      <Circle cx="50" cy="45" r="8" fill={LogoColors.green} opacity="0.7" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: 3,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 4,
    marginTop: 2,
  },
});
