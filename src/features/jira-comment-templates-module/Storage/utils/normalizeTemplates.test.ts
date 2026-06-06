import { describe, expect, it } from 'vitest';
import { DEFAULT_COMMENT_TEMPLATES } from './defaultTemplates';
import { normalizeTemplates, type NormalizableCommentTemplateInput } from './normalizeTemplates';

describe('DEFAULT_COMMENT_TEMPLATES', () => {
  it('matches requirements labels and texts without watchers', () => {
    expect(DEFAULT_COMMENT_TEMPLATES).toHaveLength(2);

    expect(DEFAULT_COMMENT_TEMPLATES[0]).toMatchObject({
      label: 'Взял в работу',
      text: 'Здравствуйте! Задача взята в работу. Вернусь с обновлением, когда появится результат.',
    });
    expect(DEFAULT_COMMENT_TEMPLATES[0]).not.toHaveProperty('watchers');

    expect(DEFAULT_COMMENT_TEMPLATES[1]).toMatchObject({
      label: 'Нужно уточнение',
      text: 'Здравствуйте! Нужно уточнить:',
    });
    expect(DEFAULT_COMMENT_TEMPLATES[1]).not.toHaveProperty('watchers');
  });

  it('uses distinct generic hex colors', () => {
    expect(DEFAULT_COMMENT_TEMPLATES[0]!.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_COMMENT_TEMPLATES[1]!.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_COMMENT_TEMPLATES[0]!.color).not.toBe(DEFAULT_COMMENT_TEMPLATES[1]!.color);
  });

  it('has stable branded ids', () => {
    expect(String(DEFAULT_COMMENT_TEMPLATES[0]!.id)).toBe('default-in-progress');
    expect(String(DEFAULT_COMMENT_TEMPLATES[1]!.id)).toBe('default-need-clarification');
  });
});

describe('normalizeTemplates', () => {
  it('trims label, text, color and watcher entries', () => {
    const result = normalizeTemplates([
      {
        id: 't1',
        label: '  Hello  ',
        color: '  #abc  ',
        text: '  body  ',
        watchers: ['  a  ', '\tb\t'],
      },
    ] as NormalizableCommentTemplateInput[]);

    expect(result).toEqual([
      expect.objectContaining({
        id: expect.anything(),
        label: 'Hello',
        color: '#aabbcc',
        text: 'body',
        watchers: ['a', 'b'],
      }),
    ]);
    expect(String(result[0]!.id)).toBe('t1');
  });

  it('drops watchers property when all watcher entries are empty after trim', () => {
    const row = normalizeTemplates([
      {
        id: 'x',
        label: 'L',
        color: 'c',
        text: 't',
        watchers: ['  ', '', '\t'],
      },
    ] as NormalizableCommentTemplateInput[])[0]!;

    expect(row).toMatchObject({ color: '#deebff' });
    expect(row).not.toHaveProperty('watchers');
  });

  it('parses watchers from comma-separated string', () => {
    expect(
      normalizeTemplates([
        {
          id: 'w',
          label: 'L',
          color: 'c',
          text: 't',
          watchers: ' iv.petrov , , jdoe ',
        },
      ] as unknown as NormalizableCommentTemplateInput[])[0]
    ).toEqual(
      expect.objectContaining({
        color: '#deebff',
        watchers: ['iv.petrov', 'jdoe'],
      })
    );
  });

  it('mints missing ids deterministically', () => {
    const a = normalizeTemplates([
      { label: 'a', color: '', text: '' },
      { label: 'b', color: '', text: '' },
    ] as NormalizableCommentTemplateInput[]);

    expect(String(a[0]!.id)).toBe('__jh-ct-0');
    expect(String(a[1]!.id)).toBe('__jh-ct-1');
    expect(a[0]!.color).toBe('#deebff');
    expect(a[1]!.color).toBe('#deebff');
  });

  it('replaces duplicate ids with unique minted ids', () => {
    const rows = normalizeTemplates([
      { id: 'same', label: '1', color: 'c', text: 't1' },
      { id: 'same', label: '2', color: 'c', text: 't2' },
    ] as NormalizableCommentTemplateInput[]);

    expect(String(rows[0]!.id)).toBe('same');
    expect(String(rows[1]!.id)).toBe('__jh-ct-0');
    expect(rows.every(r => r.color === '#deebff')).toBe(true);
  });

  it('does not steal mint-shaped explicit id later in input when an earlier row is missing id', () => {
    const rows = normalizeTemplates([
      { label: 'a', color: 'c', text: 't1' },
      { id: '__jh-ct-0', label: 'b', color: 'c', text: 't2' },
    ] as NormalizableCommentTemplateInput[]);

    expect(String(rows[0]!.id)).toBe('__jh-ct-1');
    expect(String(rows[1]!.id)).toBe('__jh-ct-0');
    expect(rows.every(r => r.color === '#deebff')).toBe(true);
  });

  it('accepts numeric id from loose input and normalizes duplicates after stringification', () => {
    const rows = normalizeTemplates([
      { id: 1 as unknown as string, label: 'a', color: 'c', text: 't' },
      { id: '1', label: 'b', color: 'c', text: 't' },
    ] as NormalizableCommentTemplateInput[]);

    expect(String(rows[0]!.id)).toBe('1');
    expect(String(rows[1]!.id)).toMatch(/^__jh-ct-/);
    expect(rows.every(r => r.color === '#deebff')).toBe(true);
  });

  it('does not mutate input rows', () => {
    const row = {
      id: 'keep',
      label: '  L  ',
      color: ' blue ',
      text: ' T ',
      watchers: [' x ', ''],
    };
    const snapshot = structuredClone(row);

    const [normalized] = normalizeTemplates([row] as NormalizableCommentTemplateInput[]);

    expect(row).toEqual(snapshot);
    expect(normalized!.color).toBe('#deebff');
  });

  it('preserves separate rows shape with optional watchers omitted when empty', () => {
    expect(normalizeTemplates([])).toEqual([]);
  });
});
