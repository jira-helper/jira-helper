import { COMMENT_TEMPLATE_HEX_COLOR_FALLBACK } from '../constants';
import { canonicalCommentTemplateHexColor, resolveCommentTemplateHexColor } from './resolveCommentTemplateHexColor';

/** Toolbar surface behind template buttons (.toolbar matches `background: #fafbfc`). */
export const COMMENT_TEMPLATE_BUTTON_SURFACE = '#fafbfc' as const;

/** Jira default N800-ish text on light surfaces; candidate when contrast vs blended bg ≥ white text. */
export const COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG = '#172b4d' as const;

/** High-contrast foreground on dark template backgrounds. */
export const COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG = '#ffffff' as const;

function rgbHexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = hex.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

const SURFACE_RGB01 = rgbHexToRgb01(COMMENT_TEMPLATE_BUTTON_SURFACE);

const DARK_FG_RGB01 = rgbHexToRgb01(COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG);

function linearizeSrgbChannel(c01: number): number {
  return c01 <= 0.03928 ? c01 / 12.92 : Math.pow((c01 + 0.055) / 1.055, 2.4);
}

function relativeLuminance01(r01: number, g01: number, b01: number): number {
  return 0.2126 * linearizeSrgbChannel(r01) + 0.7152 * linearizeSrgbChannel(g01) + 0.0722 * linearizeSrgbChannel(b01);
}

const REL_LUM_DARK_FG = relativeLuminance01(DARK_FG_RGB01.r, DARK_FG_RGB01.g, DARK_FG_RGB01.b);

/**
 * WCAG 2.x contrast ratio of two relative luminances in [0, 1].
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function contrastRatio01(lumA: number, lumB: number): number {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parses {@link canonicalCommentTemplateHexColor} output (#RRGGBB or #RRGGBBAA) into opaque sRGB via alpha blend
 * over {@link COMMENT_TEMPLATE_BUTTON_SURFACE}.
 */
function parseCanonicalHexBlendedOverSurface(canonical: string): { r: number; g: number; b: number } | null {
  if (!canonical.startsWith('#')) {
    return null;
  }
  const h = canonical.slice(1);
  let r255: number;
  let g255: number;
  let b255: number;
  let a: number;
  if (h.length === 6) {
    r255 = parseInt(h.slice(0, 2), 16);
    g255 = parseInt(h.slice(2, 4), 16);
    b255 = parseInt(h.slice(4, 6), 16);
    a = 1;
  } else if (h.length === 8) {
    r255 = parseInt(h.slice(0, 2), 16);
    g255 = parseInt(h.slice(2, 4), 16);
    b255 = parseInt(h.slice(4, 6), 16);
    a = parseInt(h.slice(6, 8), 16) / 255;
  } else {
    return null;
  }
  if ([r255, g255, b255, a].some(n => Number.isNaN(n))) {
    return null;
  }
  const t01 = r255 / 255;
  const tG01 = g255 / 255;
  const tB01 = b255 / 255;
  const r01 = t01 * a + SURFACE_RGB01.r * (1 - a);
  const g01 = tG01 * a + SURFACE_RGB01.g * (1 - a);
  const b01 = tB01 * a + SURFACE_RGB01.b * (1 - a);
  return { r: r01, g: g01, b: b01 };
}

/**
 * Resolved CSS colors for a template toolbar button: background matches {@link resolveCommentTemplateHexColor};
 * foreground picks {@link COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG} vs {@link COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG}
 * by whichever yields the higher WCAG contrast ratio vs the RGBA overlay blended over {@link COMMENT_TEMPLATE_BUTTON_SURFACE}.
 */
export function resolveCommentTemplateButtonColors(
  raw: string,
  fallback: string = COMMENT_TEMPLATE_HEX_COLOR_FALLBACK
): { background: string; foreground: string } {
  const background = resolveCommentTemplateHexColor(raw, fallback);
  const canonical = canonicalCommentTemplateHexColor(background, fallback);
  const blended = parseCanonicalHexBlendedOverSurface(canonical);
  if (!blended) {
    return { background, foreground: COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG };
  }
  const lumBg = relativeLuminance01(blended.r, blended.g, blended.b);
  const crDark = contrastRatio01(lumBg, REL_LUM_DARK_FG);
  const crWhite = contrastRatio01(lumBg, 1);
  const foreground = crDark >= crWhite ? COMMENT_TEMPLATE_BUTTON_FG_ON_LIGHT_BG : COMMENT_TEMPLATE_BUTTON_FG_ON_DARK_BG;
  return { background, foreground };
}
