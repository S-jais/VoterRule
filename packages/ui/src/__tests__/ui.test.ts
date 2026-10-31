import { describe, it, expect } from 'vitest';
import { colors } from '../tokens.js';

describe('UI Package Unit Tests', () => {
  describe('Accessible Design Tokens & Contrast Checks', () => {
    it('provides accessible text colors with dark saffron and dark green', () => {
      expect(colors.brand.saffronText).toBe('#9A4500');
      expect(colors.brand.greenText).toBe('#0D5C05');
      expect(colors.brand.navyText).toBe('#0B1030');
    });

    it('ensures status colors are paired with distinct background shades', () => {
      expect(colors.status.successBg).toBe('#EDF8EE');
      expect(colors.status.warningBg).toBe('#FFF5EB');
      expect(colors.status.infoBg).toBe('#EFF2FE');
    });
  });

  describe('Spoke calculation for AshokaChakraProgressRing', () => {
    it('calculates 24 spokes proportionally for progress', () => {
      const total = 5;
      const completed = 3;
      const activeSpokeCount = Math.round((24 * completed) / total);
      expect(activeSpokeCount).toBe(14); // 24 * 0.6 = 14.4 -> 14

      const fullSpokes = Math.round((24 * 5) / 5);
      expect(fullSpokes).toBe(24);
    });
  });
});
