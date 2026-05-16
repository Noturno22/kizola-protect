/**
 * OtpInput — six individual digit boxes with auto-focus, auto-paste, and backspace.
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface OtpInputProps {
  value: string;       // full 6-char string, e.g. "123456"
  onChange: (v: string) => void;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, disabled }) => {
  const { theme } = useTheme();
  const inputs = useRef<Array<TextInput | null>>([]);

  const digits = value.split('').slice(0, OTP_LENGTH);
  while (digits.length < OTP_LENGTH) digits.push('');

  const focusNext = useCallback((index: number) => {
    if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }, []);

  const focusPrev = useCallback((index: number) => {
    if (index > 0) inputs.current[index - 1]?.focus();
  }, []);

  const handleChange = useCallback(
    (text: string, index: number) => {
      // Auto-paste: if user pastes a 6-digit string into any field
      const cleaned = text.replace(/\D/g, '');
      if (cleaned.length === OTP_LENGTH) {
        onChange(cleaned);
        inputs.current[OTP_LENGTH - 1]?.focus();
        return;
      }

      // Normal single character entry
      const digit = cleaned.slice(-1); // take last digit in case of overtype
      const newDigits = [...digits];
      newDigits[index] = digit;
      onChange(newDigits.join(''));
      if (digit) focusNext(index);
    },
    [digits, onChange, focusNext]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index]) {
        focusPrev(index);
      }
    },
    [digits, focusPrev]
  );

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          style={[
            styles.box,
            {
              borderColor: digit ? theme.primary : theme.cardBorderAlt,
              backgroundColor: theme.background,
              color: theme.text,
              // Subtle scale on filled box via border width
              borderWidth: digit ? 2 : 1.5,
            },
          ]}
          value={digit}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH} // allow paste of full code
          selectTextOnFocus
          editable={!disabled}
          textAlign="center"
          autoFocus={i === 0}
          // Android: disable predictive text
          autoCorrect={false}
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          textContentType="oneTimeCode"
          importantForAutofill="yes"
          accessible
          accessibilityLabel={`OTP digit ${i + 1}`}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 16,
  },
  box: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '700',
  },
});
