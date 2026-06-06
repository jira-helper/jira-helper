import { describe, expect, it } from 'vitest';
import { COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import type { EditableCommentTemplate } from '../../types';
import { toCommentTemplateId } from '../../types';
import { serializeTemplates } from './serializeTemplates';
import { validateImportedTemplates } from './validateImportedTemplates';

describe('validateImportedTemplates', () => {
  it('accepts valid v1 payload and returns normalized templates', () => {
    const jsonText = JSON.stringify({
      version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
      templates: [
        {
          id: 't1',
          label: '  A  ',
          color: ' #00f ',
          text: ' body ',
          watchers: [' x ', 'y'],
        },
      ],
    });

    const result = validateImportedTemplates(jsonText);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.val).toEqual([
      expect.objectContaining({
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#0000ff',
        text: 'body',
        watchers: ['x', 'y'],
      }),
    ]);
  });

  it('accepts valid legacy root array', () => {
    const jsonText = JSON.stringify([{ id: 'legacy-1', label: 'L', color: 'c', text: 't', watchers: 'a, b' }]);

    const result = validateImportedTemplates(jsonText);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.val[0]).toEqual(
      expect.objectContaining({
        id: toCommentTemplateId('legacy-1'),
        label: 'L',
        color: '#deebff',
        text: 't',
        watchers: ['a', 'b'],
      })
    );
  });

  it('returns Err for invalid JSON', () => {
    const result = validateImportedTemplates('{ not json');
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val).toEqual([
      expect.objectContaining({ field: 'file', message: expect.stringContaining('Invalid JSON') }),
    ]);
  });

  it('returns Err for invalid root schema', () => {
    const result = validateImportedTemplates(JSON.stringify({ foo: 1 }));
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val[0]!.field).toBe('file');
    expect(result.val[0]!.message).toContain('templates');
  });

  it('returns Err when v1 templates is not an array', () => {
    const result = validateImportedTemplates(
      JSON.stringify({ version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION, templates: {} })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.message.includes('"templates" must be an array'))).toBe(true);
  });

  it('returns Err for wrong payload version', () => {
    const result = validateImportedTemplates(JSON.stringify({ version: 99, templates: [] }));
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val[0]!.message).toMatch(/Unsupported payload version/i);
  });

  it('returns Err when required string fields are empty after trim', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'x', label: 'ok', color: '   ', text: 't' }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'color')).toBe(true);
  });

  it('returns Err with field label when label is a number (must be non-empty string)', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'x', label: 123, color: '#fff', text: 'body' }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'label')).toBe(true);
  });

  it('returns Err with field color when color is boolean', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'x', label: 'L', color: true, text: 'body' }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'color')).toBe(true);
  });

  it('returns Err with field text when text is an object', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'x', label: 'L', color: '#fff', text: { nested: 1 } }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'text')).toBe(true);
  });

  it('returns Err for watchers with unsupported type (conservative)', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'w', label: 'L', color: 'c', text: 't', watchers: 42 }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'watchers')).toBe(true);
  });

  it('returns Err with field watchers when watchers array contains a non-string element', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'w', label: 'L', color: 'c', text: 't', watchers: ['ok', 2, 'bad'] }],
      })
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.val.some(e => e.field === 'watchers')).toBe(true);
  });

  it('accepts watchers as CSV string (legacy-compatible)', () => {
    const result = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'w', label: 'L', color: 'c', text: 't', watchers: ' a , b ' }],
      })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.val[0]!.watchers).toEqual(['a', 'b']);
    expect(result.val[0]!.color).toBe('#deebff');
  });

  it('allows watchers undefined or null on import', () => {
    const noWatchers = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'w', label: 'L', color: 'c', text: 't' }],
      })
    );
    expect(noWatchers.ok).toBe(true);
    if (noWatchers.ok) {
      expect(noWatchers.val[0]!.color).toBe('#deebff');
    }
    const nullWatchers = validateImportedTemplates(
      JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [{ id: 'w', label: 'L', color: 'c', text: 't', watchers: null }],
      })
    );
    expect(nullWatchers.ok).toBe(true);
    if (nullWatchers.ok) {
      expect(nullWatchers.val[0]!.color).toBe('#deebff');
    }
  });

  it('does not mutate legacy source rows when parsing', () => {
    const rows = [{ id: 'keep', label: '  L  ', color: 'c', text: 't' }];
    const snapshot = structuredClone(rows);
    const result = validateImportedTemplates(JSON.stringify(rows));
    expect(result.ok).toBe(true);
    expect(rows).toEqual(snapshot);
  });

  it('preserve explicit id: minted id only for missing id; explicit __jh-ct-* kept per normalization rules', () => {
    const jsonText = JSON.stringify([
      { label: 'a', color: 'c', text: 't1' },
      { id: '__jh-ct-0', label: 'b', color: 'c', text: 't2' },
    ]);

    const result = validateImportedTemplates(jsonText);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(String(result.val[0]!.id)).toBe('__jh-ct-1');
    expect(String(result.val[1]!.id)).toBe('__jh-ct-0');
    expect(result.val[0]!.color).toBe('#deebff');
    expect(result.val[1]!.color).toBe('#deebff');
  });
});

describe('serializeTemplates', () => {
  it('exports v1 payload shape with canonical version constant', () => {
    const templates = [
      {
        id: toCommentTemplateId('one'),
        label: 'L',
        color: '#fff',
        text: 'hello',
      },
    ];
    const text = serializeTemplates(templates);
    const parsed = JSON.parse(text) as { version: number; templates: unknown[] };
    expect(parsed.version).toBe(COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION);
    expect(parsed.templates).toHaveLength(1);
    expect(parsed.templates[0]).toEqual({
      id: 'one',
      label: 'L',
      color: '#fff',
      text: 'hello',
    });
  });

  it('pretty-prints with indentation', () => {
    const text = serializeTemplates([
      { id: toCommentTemplateId('a'), label: 'x', color: 'y', text: 'z', watchers: ['u'] },
    ]);
    expect(text).toContain('\n  "version"');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('exports canonical v1 rows without UI-only or unknown enumerable fields', () => {
    const draft = {
      id: toCommentTemplateId('one'),
      label: 'L',
      color: '#fff',
      text: 'hello',
      isNew: true,
      extraFromPrototype: 'leak',
    } as EditableCommentTemplate & { extraFromPrototype: string };

    const text = serializeTemplates([draft]);
    const parsed = JSON.parse(text) as { templates: Array<Record<string, unknown>> };
    expect(Object.keys(parsed.templates[0]!).sort()).toEqual(['color', 'id', 'label', 'text']);
  });

  it('includes watchers in export only when array is non-empty', () => {
    const emptyWatchers = serializeTemplates([
      { id: toCommentTemplateId('a'), label: 'x', color: 'y', text: 'z', watchers: [] },
    ]);
    const parsedEmpty = JSON.parse(emptyWatchers) as { templates: Array<Record<string, unknown>> };
    expect('watchers' in parsedEmpty.templates[0]!).toBe(false);

    const withWatchers = serializeTemplates([
      { id: toCommentTemplateId('b'), label: 'x', color: 'y', text: 'z', watchers: ['u'] },
    ]);
    const parsedOk = JSON.parse(withWatchers) as { templates: Array<Record<string, unknown>> };
    expect(parsedOk.templates[0]!.watchers).toEqual(['u']);
  });
});
