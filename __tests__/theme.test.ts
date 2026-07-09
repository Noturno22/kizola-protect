import { SPACING, RADIUS, FONT, SHADOW, ANIM, LAYOUT, GRID } from '@/constants/theme';

describe('SPACING', () => {
  it('has all spacing tokens defined as non-negative numbers', () => {
    const values = Object.values(SPACING);
    expect(values.length).toBeGreaterThan(0);
    values.forEach(v => {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it('uses 4px base unit', () => {
    expect(SPACING.xs).toBe(4);
    expect(SPACING.md).toBe(12);
    expect(SPACING.lg).toBe(16);
    expect(SPACING.xl).toBe(20);
    expect(SPACING.xxl).toBe(24);
  });
});

describe('RADIUS', () => {
  it('has all radius tokens defined', () => {
    expect(RADIUS.sm).toBe(6);
    expect(RADIUS.xl).toBe(12);
    expect(RADIUS.round).toBe(16);
    expect(RADIUS.full).toBe(9999);
  });
});

describe('FONT', () => {
  it('has size tokens defined', () => {
    expect(FONT.size.caption).toBe(10);
    expect(FONT.size.base).toBe(14);
    expect(FONT.size.display).toBe(28);
  });

  it('has weight tokens defined', () => {
    expect(FONT.weight.bold).toBe('700');
    expect(FONT.weight.extrabold).toBe('800');
  });
});

describe('SHADOW', () => {
  it('card shadow has required properties', () => {
    expect(SHADOW.card).toHaveProperty('shadowColor');
    expect(SHADOW.card).toHaveProperty('shadowOffset');
    expect(SHADOW.card).toHaveProperty('shadowOpacity');
    expect(SHADOW.card).toHaveProperty('elevation');
  });

  it('glow factory returns shadow with given color', () => {
    const glow = SHADOW.glow('#00C8B4');
    expect(glow.shadowColor).toBe('#00C8B4');
    expect(glow.elevation).toBe(4);
  });
});

describe('ANIM', () => {
  it('has duration tokens', () => {
    expect(ANIM.duration.fast).toBe(200);
    expect(ANIM.duration.normal).toBe(300);
    expect(ANIM.duration.slow).toBe(500);
    expect(ANIM.duration.pulse).toBe(900);
  });
});

describe('LAYOUT', () => {
  it('has icon size tokens', () => {
    expect(LAYOUT.icon.sm).toBe(16);
    expect(LAYOUT.icon.xl).toBe(24);
    expect(LAYOUT.icon.avatar).toBe(40);
  });

  it('has button size tokens', () => {
    expect(LAYOUT.button.sm).toBe(36);
    expect(LAYOUT.button.xl).toBe(48);
  });
});

describe('GRID', () => {
  it('has gutter and column count', () => {
    expect(GRID.gutter).toBe(10);
    expect(GRID.columnCount).toBe(2);
  });
});
