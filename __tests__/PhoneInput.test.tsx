import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhoneInput } from '@/components/auth/PhoneInput';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/providers/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      background: '#FFFFFF',
      text: '#000000',
      textMuted: '#999999',
      cardBorderAlt: '#E0E0E0',
      surface: '#F5F5F5',
      primary: '#007AFF',
    },
  }),
}));

jest.mock('lucide-react-native', () => ({
  Search: 'Search',
  ChevronDown: 'ChevronDown',
  X: 'X',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PhoneInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with phone number placeholder', () => {
    const { getByPlaceholderText } = render(<PhoneInput {...defaultProps} />);
    expect(getByPlaceholderText('Phone number')).toBeTruthy();
  });

  it('displays the default country code +244', () => {
    const { getByText } = render(<PhoneInput {...defaultProps} />);
    expect(getByText('+244')).toBeTruthy();
  });

  it('displays the Angola flag', () => {
    const { getByText } = render(<PhoneInput {...defaultProps} />);
    expect(getByText('🇦🇴')).toBeTruthy();
  });

  it('calls onChangeText with country code when typing', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <PhoneInput {...defaultProps} onChange={onChange} />
    );

    const input = getByPlaceholderText('Phone number');
    fireEvent.changeText(input, '912345678');

    // Should call onChange with the default country code + digits
    expect(onChange).toHaveBeenCalledWith('+244912345678');
  });

  it('strips non-digit characters from input', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <PhoneInput {...defaultProps} onChange={onChange} />
    );

    const input = getByPlaceholderText('Phone number');
    fireEvent.changeText(input, 'abc123');

    expect(onChange).toHaveBeenCalledWith('+244123');
  });

  it('has accessibility label on phone input', () => {
    const { getByLabelText } = render(<PhoneInput {...defaultProps} />);
    expect(getByLabelText('Phone number')).toBeTruthy();
  });

  it('has accessibility label on country selector', () => {
    const { getByLabelText } = render(<PhoneInput {...defaultProps} />);
    expect(getByLabelText('Select country code')).toBeTruthy();
  });

  it('has accessibility hint on country selector', () => {
    const { getByLabelText } = render(<PhoneInput {...defaultProps} />);
    const btn = getByLabelText('Select country code');
    expect(btn.props.accessibilityHint).toBe('Double tap to select your country code');
  });

  it('is editable by default', () => {
    const { getByPlaceholderText } = render(<PhoneInput {...defaultProps} />);
    const input = getByPlaceholderText('Phone number');
    expect(input.props.editable).not.toBe(false);
  });

  it('is not editable when disabled', () => {
    const { getByPlaceholderText } = render(
      <PhoneInput {...defaultProps} disabled />
    );
    const input = getByPlaceholderText('Phone number');
    expect(input.props.editable).toBe(false);
  });

  it('sets keyboard type to phone-pad', () => {
    const { getByPlaceholderText } = render(<PhoneInput {...defaultProps} />);
    const input = getByPlaceholderText('Phone number');
    expect(input.props.keyboardType).toBe('phone-pad');
  });
});
