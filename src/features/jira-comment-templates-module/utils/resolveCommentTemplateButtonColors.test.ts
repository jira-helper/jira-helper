import { describe, expect, it } from 'vitest';

import { COMMENT_TEMPLATE_HEX_COLOR_FALLBACK } from '../constants';

import {
  COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG,
  COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG,
  COMMENT_TEMPLATE_BUTTON_SURFACE,
  resolveCommentTemplateButtonColors,
} from './resolveCommentTemplateButtonColors';

/**
 * WCAG 2 contrast ratio from two relative luminances (spec duplication — not coupling to prod helpers).
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function wcagContrastRatio(lumA: number, lumB: number): number {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG relative luminance helper; tests depend on the WCAG definition, not prod `linearizeSrgbChannel`. */
function linSrgbWcag(c01: number): number {
  return c01 <= 0.03928 ? c01 / 12.92 : Math.pow((c01 + 0.055) / 1.055, 2.4);
}

function relativeLuminanceFromRgb01(r01: number, g01: number, b01: number): number {
  return 0.2126 * linSrgbWcag(r01) + 0.7152 * linSrgbWcag(g01) + 0.0722 * linSrgbWcag(b01);
}

/** Parse #rgb / #RRGGBB into 0–1 channels. */
function cssHexToRgb01(cssHex: string): { r: number; g: number; b: number } {
  const h = cssHex.slice(1);
  const full = h.length === 3 ? [...h].map(ch => ch + ch).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

function expectedForegroundForOpaqueBackground(cssHex: string): string {
  const { r, g, b } = cssHexToRgb01(cssHex);
  const lumBg = relativeLuminanceFromRgb01(r, g, b);
  const dark = cssHexToRgb01(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
  const lumDarkFg = relativeLuminanceFromRgb01(dark.r, dark.g, dark.b);
  const crDark = wcagContrastRatio(lumBg, lumDarkFg);
  const crWhite = wcagContrastRatio(lumBg, 1);
  return crDark >= crWhite ? COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG : COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG;
}

describe('resolveCommentTemplateButtonColors', () => {
  it('exposes toolbar surface (#fafbfc) aligned with .toolbar background', () => {
    expect(COMMENT_TEMPLATE_BUTTON_SURFACE).toBe('#fafbfc');
  });

  it('uses Jira dark text on light solid backgrounds', () => {
    expect(resolveCommentTemplateButtonColors('#ffffff').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
    expect(resolveCommentTemplateButtonColors('#deebff').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
    expect(resolveCommentTemplateButtonColors('#deebff').background).toBe('#deebff');
  });

  it('uses white text on dark solid backgrounds', () => {
    expect(resolveCommentTemplateButtonColors('#000000').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
    expect(resolveCommentTemplateButtonColors('#172b4d').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
  });

  it('saturated bright blue is light by luminance but white text wins on contrast', () => {
    expect(resolveCommentTemplateButtonColors('#0774e5').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
  });

  it('opaque solid colors: foreground matches higher WCAG contrast vs dark vs white candidates', () => {
    const samples = ['#ffffff', '#deebff', '#000000', '#172b4d', '#0774e5', '#ff00aa', '#00aa55', '#88ff00'];
    for (const hex of samples) {
      const { background, foreground } = resolveCommentTemplateButtonColors(hex);
      expect(expectedForegroundForOpaqueBackground(background)).toBe(foreground);
    }
  });

  it('accepts 3-digit shorthand hex', () => {
    const resolved = resolveCommentTemplateButtonColors('#abc');
    expect(resolved.background).toBe('#abc');
    expect(resolved.foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
  });

  it('blends 4-digit #RGBA over toolbar surface before choosing foreground', () => {
    // Fully transparent → surface #fafbfc → dark text
    expect(resolveCommentTemplateButtonColors('#f000').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
    // Opaque near-black → white text
    expect(resolveCommentTemplateButtonColors('#000f').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
  });

  it('blends 8-digit #RRGGBBAA over toolbar surface before choosing foreground', () => {
    expect(resolveCommentTemplateButtonColors('#000000cc').foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
    const lightOverlay = resolveCommentTemplateButtonColors('#ffffff22');
    expect(lightOverlay.foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
  });

  it('full transparency matches WCAG pick for blended background ≈ toolbar surface', () => {
    const { r, g, b } = cssHexToRgb01(COMMENT_TEMPLATE_BUTTON_SURFACE);
    const lumSurface = relativeLuminanceFromRgb01(r, g, b);
    const dark = cssHexToRgb01(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
    const lumDarkFg = relativeLuminanceFromRgb01(dark.r, dark.g, dark.b);
    const crDark = wcagContrastRatio(lumSurface, lumDarkFg);
    const crWhite = wcagContrastRatio(lumSurface, 1);
    const expected = crDark >= crWhite ? COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG : COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG;
    expect(resolveCommentTemplateButtonColors('#f000').foreground).toBe(expected);
  });

  it('falls back to default template background and picks matching foreground when invalid', () => {
    const resolved = resolveCommentTemplateButtonColors('not-a-color');
    expect(resolved.background).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(resolved.foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);
  });

  it('respects custom fallback hex for background', () => {
    const resolved = resolveCommentTemplateButtonColors('nope', '#000000');
    expect(resolved.background).toBe('#000000');
    expect(resolved.foreground).toBe(COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG);
  });
});
