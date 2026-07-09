import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OtpInput } from '@/components/auth/OtpInput';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/providers/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      primary: '#007AFF',
      text: '#000000',
      textMuted: '#999999',
      cardBorderAlt: '#E0E0E0',
      background: '#FFFFFF',
    },
  }),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OtpInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 6 digit boxes', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);

    for (let i = 1; i <= 6; i++) {
      expect(getByLabelText(`OTP digit ${i}`)).toBeTruthy();
    }
  });

  it('each box has the correct accessibility hint', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);

    for (let i = 1; i <= 6; i++) {
      const box = getByLabelText(`OTP digit ${i}`);
      expect(box.props.accessibilityHint).toBe(
        `Enter digit ${i} of your verification code`
      );
    }
  });

  it('all boxes are accessible', () => {
    const { getAllByLabelText } = render(<OtpInput {...defaultProps} />);
    const boxes = getAllByLabelText(/^OTP digit/);
    expect(boxes).toHaveLength(6);
  });

  it('first box has autoFocus', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.autoFocus).toBe(true);
  });

  it('subsequent boxes do not have autoFocus', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const secondBox = getByLabelText('OTP digit 2');
    expect(secondBox.props.autoFocus).toBe(false);
  });

  it('calls onChange with digit when typing', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <OtpInput {...defaultProps} onChange={onChange} />
    );

    const firstBox = getByLabelText('OTP digit 1');
    fireEvent.changeText(firstBox, '5');

    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('handles full 6-digit paste into one field', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <OtpInput {...defaultProps} onChange={onChange} />
    );

    const firstBox = getByLabelText('OTP digit 1');
    fireEvent.changeText(firstBox, '123456');

    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('displays existing value across boxes', () => {
    const { getByLabelText } = render(
      <OtpInput value="123456" onChange={jest.fn()} />
    );

    expect(getByLabelText('OTP digit 1').props.value).toBe('1');
    expect(getByLabelText('OTP digit 2').props.value).toBe('2');
    expect(getByLabelText('OTP digit 3').props.value).toBe('3');
    expect(getByLabelText('OTP digit 4').props.value).toBe('4');
    expect(getByLabelText('OTP digit 5').props.value).toBe('5');
    expect(getByLabelText('OTP digit 6').props.value).toBe('6');
  });

  it('handles partial value', () => {
    const { getByLabelText } = render(
      <OtpInput value="12" onChange={jest.fn()} />
    );

    expect(getByLabelText('OTP digit 1').props.value).toBe('1');
    expect(getByLabelText('OTP digit 2').props.value).toBe('2');
    expect(getByLabelText('OTP digit 3').props.value).toBe('');
    expect(getByLabelText('OTP digit 4').props.value).toBe('');
    expect(getByLabelText('OTP digit 5').props.value).toBe('');
    expect(getByLabelText('OTP digit 6').props.value).toBe('');
  });

  it('sets keyboard type to number-pad', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.keyboardType).toBe('number-pad');
  });

  it('sets maxLength to 6 to allow paste', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.maxLength).toBe(6);
  });

  it('is not editable when disabled', () => {
    const { getByLabelText } = render(
      <OtpInput {...defaultProps} disabled />
    );
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.editable).toBe(false);
  });

  it('has textContentType set for OTP autofill', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.textContentType).toBe('oneTimeCode');
  });

  it('has importantForAutofill set', () => {
    const { getByLabelText } = render(<OtpInput {...defaultProps} />);
    const firstBox = getByLabelText('OTP digit 1');
    expect(firstBox.props.importantForAutofill).toBe('yes');
  });
});
