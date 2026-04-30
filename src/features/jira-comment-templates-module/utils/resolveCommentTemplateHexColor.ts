import { COMMENT_TEMPLATE_HEX_COLOR_FALLBACK } from '../constants';

const CSS_HEX_COLOR_RE = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function canonicalizeValidatedHex(cssHex: string): string {
  const lower = cssHex.trim().toLowerCase();
  if (lower.length === 4) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  if (lower.length === 5) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}${lower[4]}${lower[4]}`;
  }
  return lower;
}

/**
 * Canonical hex for equality, drafts, and persistence: lowercase, shorthand expanded to #RRGGBB / #RRGGBBAA.
 * Invalid input returns a canonicalized `fallback` when it is valid hex; otherwise returns `fallback` as given.
 */
export function canonicalCommentTemplateHexColor(
  raw: string,
  fallback: string = COMMENT_TEMPLATE_HEX_COLOR_FALLBACK
): string {
  const t = raw.trim();
  if (t.length === 0 || !CSS_HEX_COLOR_RE.test(t)) {
    const f = fallback.trim();
    return CSS_HEX_COLOR_RE.test(f) ? canonicalizeValidatedHex(f) : fallback;
  }
  return canonicalizeValidatedHex(t);
}

/**
 * Returns a CSS hex color safe for Ant Design {@link ColorPicker} and `--jh-template-accent`.
 * Empty or non-hex strings fall back to {@link COMMENT_TEMPLATE_HEX_COLOR_FALLBACK}.
 */
export function resolveCommentTemplateHexColor(
  raw: string,
  fallback: string = COMMENT_TEMPLATE_HEX_COLOR_FALLBACK
): string {
  const t = raw.trim();
  if (t.length === 0) {
    return fallback;
  }
  return CSS_HEX_COLOR_RE.test(t) ? t : fallback;
}
