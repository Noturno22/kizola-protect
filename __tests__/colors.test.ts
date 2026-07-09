import { COLORS } from '@/constants/colors';

describe('COLORS', () => {
  it('has a primary color defined', () => {
    expect(COLORS.primary).toBeDefined();
    expect(typeof COLORS.primary).toBe('string');
  });

  it('has a success color defined', () => {
    expect(COLORS.success).toBeDefined();
    expect(typeof COLORS.success).toBe('string');
  });

  it('has an error color defined', () => {
    expect(COLORS.error).toBeDefined();
    expect(typeof COLORS.error).toBe('string');
  });

  it('has textPrimary defined', () => {
    expect(COLORS.textPrimary).toBeDefined();
    expect(typeof COLORS.textPrimary).toBe('string');
  });

  it('has all required color keys', () => {
    const requiredKeys: Array<keyof typeof COLORS> = [
      'primary',
      'primaryLight',
      'primaryDark',
      'success',
      'error',
      'warning',
      'info',
      'textPrimary',
      'textSecondary',
      'textMuted',
      'textLight',
      'bgLight',
      'bgDark',
      'surfaceLight',
      'surfaceDark',
      'borderLight',
      'borderDark',
      'white',
      'black',
      'overlay',
    ];

    for (const key of requiredKeys) {
      expect(COLORS).toHaveProperty(key);
      const value = COLORS[key];
      if (typeof value === 'string') {
        expect(typeof value).toBe('string');
      } else if (Array.isArray(value)) {
        expect(Array.isArray(value)).toBe(true);
      }
    }
  });
});
