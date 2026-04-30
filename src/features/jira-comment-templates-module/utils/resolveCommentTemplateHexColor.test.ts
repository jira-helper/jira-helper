import { describe, expect, it } from 'vitest';
import { COMMENT_TEMPLATE_HEX_COLOR_FALLBACK } from '../constants';
import { canonicalCommentTemplateHexColor, resolveCommentTemplateHexColor } from './resolveCommentTemplateHexColor';

describe('canonicalCommentTemplateHexColor', () => {
  it('lower-cases 6- and 8-digit hex', () => {
    expect(canonicalCommentTemplateHexColor('#DEEBFF')).toBe('#deebff');
    expect(canonicalCommentTemplateHexColor('#FfEbE6')).toBe('#ffebe6');
    expect(canonicalCommentTemplateHexColor('#AaBbCcDd')).toBe('#aabbccdd');
  });

  it('expands 3- and 4-digit shorthand', () => {
    expect(canonicalCommentTemplateHexColor('#abc')).toBe('#aabbcc');
    expect(canonicalCommentTemplateHexColor('#ABCD')).toBe('#aabbccdd');
  });

  it('returns fallback for empty or invalid hex like resolve', () => {
    expect(canonicalCommentTemplateHexColor('')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(canonicalCommentTemplateHexColor('blue')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
  });
});

describe('resolveCommentTemplateHexColor', () => {
  it('returns fallback for empty or whitespace-only input', () => {
    expect(resolveCommentTemplateHexColor('')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(resolveCommentTemplateHexColor('  \t')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
  });

  it('accepts 3-, 4-, 6- and 8-digit hex including lowercase', () => {
    expect(resolveCommentTemplateHexColor('#abc')).toBe('#abc');
    expect(resolveCommentTemplateHexColor('#ABCD')).toBe('#ABCD');
    expect(resolveCommentTemplateHexColor('#aabbcc')).toBe('#aabbcc');
    expect(resolveCommentTemplateHexColor('#aabbccdd')).toBe('#aabbccdd');
  });

  it('returns fallback for non-hex tokens', () => {
    expect(resolveCommentTemplateHexColor('c')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(resolveCommentTemplateHexColor('blue')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(resolveCommentTemplateHexColor('#gg0000')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
    expect(resolveCommentTemplateHexColor('#12')).toBe(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK);
  });

  it('respects custom fallback', () => {
    expect(resolveCommentTemplateHexColor('nope', '#ffffff')).toBe('#ffffff');
  });
});
