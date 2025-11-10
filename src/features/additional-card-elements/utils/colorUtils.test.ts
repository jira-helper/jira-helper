import { describe, it, expect } from 'vitest';
import { PASTEL_COLORS, getAutoColor, getLinkColor, isLightColor, getContrastTextColor } from './colorUtils';

describe('colorUtils', () => {
  describe('PASTEL_COLORS', () => {
    it('should contain 50 colors', () => {
      expect(PASTEL_COLORS).toHaveLength(50);
    });

    it('should contain valid hex colors', () => {
      PASTEL_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should contain unique colors', () => {
      const uniqueColors = new Set(PASTEL_COLORS);
      expect(uniqueColors.size).toBe(50);
    });
  });

  describe('getAutoColor', () => {
    it('should return a color from PASTEL_COLORS', () => {
      const color = getAutoColor('PROJ-123', 'Test Issue');
      expect(PASTEL_COLORS).toContain(color);
    });

    it('should return consistent colors for same input', () => {
      const color1 = getAutoColor('PROJ-123', 'Test Issue');
      const color2 = getAutoColor('PROJ-123', 'Test Issue');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different inputs', () => {
      const color1 = getAutoColor('PROJ-123', 'Test Issue');
      const color2 = getAutoColor('PROJ-456', 'Different Issue');
      expect(color1).not.toBe(color2);
    });

    it('should handle empty strings', () => {
      const color = getAutoColor('', '');
      expect(PASTEL_COLORS).toContain(color);
    });

    it('should handle special characters', () => {
      const color = getAutoColor('PROJ-123!@#', 'Test Issue with Special Chars');
      expect(PASTEL_COLORS).toContain(color);
    });
  });

  describe('getLinkColor', () => {
    it('should return custom color when provided', () => {
      const customColor = '#FF0000';
      const result = getLinkColor(customColor, 'PROJ-123', 'Test Issue');
      expect(result).toBe(customColor);
    });

    it('should return auto color when custom color is undefined', () => {
      const result = getLinkColor(undefined, 'PROJ-123', 'Test Issue');
      expect(PASTEL_COLORS).toContain(result);
    });

    it('should return auto color when custom color is empty string', () => {
      const result = getLinkColor('', 'PROJ-123', 'Test Issue');
      expect(PASTEL_COLORS).toContain(result);
    });
  });

  describe('isLightColor', () => {
    it('should return true for light colors', () => {
      expect(isLightColor('#FFFFFF')).toBe(true);
      expect(isLightColor('#FFFF00')).toBe(true);
      expect(isLightColor('#00FFFF')).toBe(true);
    });

    it('should return false for dark colors', () => {
      expect(isLightColor('#000000')).toBe(false);
      expect(isLightColor('#0000FF')).toBe(false);
      expect(isLightColor('#800000')).toBe(false);
    });

    it('should handle colors without # prefix', () => {
      expect(isLightColor('FFFFFF')).toBe(true);
      expect(isLightColor('000000')).toBe(false);
    });
  });

  describe('getContrastTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getContrastTextColor('#FFFFFF')).toBe('#000000');
      expect(getContrastTextColor('#FFFF00')).toBe('#000000');
    });

    it('should return white for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('#FFFFFF');
      expect(getContrastTextColor('#0000FF')).toBe('#FFFFFF');
    });

    it('should handle colors without # prefix', () => {
      expect(getContrastTextColor('FFFFFF')).toBe('#000000');
      expect(getContrastTextColor('000000')).toBe('#FFFFFF');
    });
  });

  describe('Integration tests', () => {
    it('should work with real issue data', () => {
      const issueKey = 'PROJ-123';
      const issueSummary = 'Implement new feature';

      const autoColor = getAutoColor(issueKey, issueSummary);
      const linkColor = getLinkColor(undefined, issueKey, issueSummary);
      const textColor = getContrastTextColor(autoColor);

      expect(PASTEL_COLORS).toContain(autoColor);
      expect(linkColor).toBe(autoColor);
      expect(['#000000', '#FFFFFF']).toContain(textColor);
    });

    it('should work with custom color', () => {
      const customColor = '#FF5733';
      const issueKey = 'PROJ-123';
      const issueSummary = 'Implement new feature';

      const linkColor = getLinkColor(customColor, issueKey, issueSummary);
      const textColor = getContrastTextColor(linkColor);

      expect(linkColor).toBe(customColor);
      expect(['#000000', '#FFFFFF']).toContain(textColor);
    });
  });
});


