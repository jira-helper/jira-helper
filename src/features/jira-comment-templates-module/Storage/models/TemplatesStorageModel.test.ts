import { describe, expect, it } from 'vitest';
import { Err, Ok } from 'ts-results';
import { proxy } from 'valtio';
import type { ILocalStorageService } from 'src/infrastructure/storage/LocalStorageService';
import { COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import type { CommentTemplate } from '../../types';
import { toCommentTemplateId } from '../../types';
import { DEFAULT_COMMENT_TEMPLATES } from '../utils/defaultTemplates';
import { TemplatesStorageModel } from './TemplatesStorageModel';

function createFakeStorage(
  initial: Map<string, string>,
  behavior?: {
    getItem?: (key: string) => ReturnType<ILocalStorageService['getItem']>;
    setItem?: (key: string, value: string) => ReturnType<ILocalStorageService['setItem']>;
  }
): { service: ILocalStorageService; map: Map<string, string>; setCalls: [string, string][] } {
  const map = initial;
  const setCalls: [string, string][] = [];

  const service: ILocalStorageService = {
    getItem(key: string) {
      if (behavior?.getItem) {
        return behavior.getItem(key);
      }
      return Ok(map.has(key) ? map.get(key)! : null);
    },
    setItem(key: string, value: string) {
      setCalls.push([key, value]);
      if (behavior?.setItem) {
        return behavior.setItem(key, value);
      }
      map.set(key, value);
      return Ok(undefined);
    },
    removeItem(key: string) {
      map.delete(key);
      return Ok(undefined);
    },
  };

  return { service, map, setCalls };
}

describe('TemplatesStorageModel', () => {
  describe('load', () => {
    it('empty storage yields default templates, loaded, without writing storage', async () => {
      const { service, map, setCalls } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.loadState).toBe('loaded');
      expect(model.error).toBeNull();
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(map.has(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe(false);
      expect(setCalls).toHaveLength(0);
    });

    it('valid v1 payload yields normalized templates and loaded', async () => {
      const raw = {
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [
          {
            id: 'a',
            label: '  L  ',
            color: ' #fff ',
            text: ' t ',
            watchers: ['  x  ', 'y'],
          },
        ],
      };
      const { service } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, JSON.stringify(raw)]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.loadState).toBe('loaded');
      expect(model.error).toBeNull();
      expect(model.templates).toHaveLength(1);
      expect(model.templates[0]).toMatchObject({
        id: toCommentTemplateId('a'),
        label: 'L',
        color: '#ffffff',
        text: 't',
        watchers: ['x', 'y'],
      });
    });

    it('invalid JSON sets error, defaults in memory, returns Err, does not write', async () => {
      const { service, map, setCalls } = createFakeStorage(
        new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, '{ not json']])
      );
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.error).toBeTruthy();
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe('{ not json');
      expect(setCalls).toHaveLength(0);
    });

    it('unsupported version sets error, defaults, returns Err, no overwrite', async () => {
      const payload = JSON.stringify({ version: 999, templates: [] });
      const { service, map, setCalls } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.error).toContain('999');
      expect(model.hasTemplates).toBe(true);
      expect(map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe(payload);
      expect(setCalls).toHaveLength(0);
    });

    it('invalid schema (templates not array) sets error and defaults', async () => {
      const payload = JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: {},
      });
      const { service } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.templates.length).toBeGreaterThan(0);
    });

    it('v1 payload with null element sets error, defaults in memory, Err, no setItem', async () => {
      const payload = JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [null],
      });
      const { service, map, setCalls } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.error).toBeTruthy();
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe(payload);
      expect(setCalls).toHaveLength(0);
    });

    it('v1 payload with primitive row sets error, defaults, Err, no overwrite', async () => {
      const payload = JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: ['not-an-object'],
      });
      const { service, map, setCalls } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.error).toBeTruthy();
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe(payload);
      expect(setCalls).toHaveLength(0);
    });

    it('v1 payload with array row (templates: [[]]) sets error, defaults, Err, no setItem', async () => {
      const payload = JSON.stringify({
        version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
        templates: [[]],
      });
      const { service, map, setCalls } = createFakeStorage(new Map([[COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload]]));
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.loadState).toBe('error');
      expect(model.error).toBeTruthy();
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)).toBe(payload);
      expect(setCalls).toHaveLength(0);
    });

    it('getItem Err yields defaults, error state, Err result', async () => {
      const storageError = new Error('quota');
      const { service } = createFakeStorage(new Map(), {
        getItem: () => Err(storageError),
      });
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.load();

      expect(result.err).toBe(true);
      if (result.err) {
        expect(result.val).toBe(storageError);
      }
      expect(model.loadState).toBe('error');
      expect(model.error).toBe('quota');
      expect(model.hasTemplates).toBe(true);
    });

    it('starts in loading then settles', async () => {
      const { service } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));

      const p = model.load();
      expect(model.loadState === 'loading' || model.loadState === 'loaded').toBe(true);
      await p;
      expect(model.loadState).toBe('loaded');
    });
  });

  describe('saveTemplates', () => {
    it('normalizes before write and updates state only on success', async () => {
      const { service, map } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));

      const incoming: CommentTemplate[] = [
        {
          id: toCommentTemplateId('  id1  '),
          label: '  a  ',
          color: ' c ',
          text: ' t ',
        },
      ];

      const result = await model.saveTemplates(incoming);

      expect(result.ok).toBe(true);
      expect(model.templates[0]).toMatchObject({
        id: toCommentTemplateId('id1'),
        label: 'a',
        color: '#deebff',
        text: 't',
      });
      const written = map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)!;
      const parsed = JSON.parse(written) as { version: number; templates: CommentTemplate[] };
      expect(parsed.version).toBe(COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION);
      expect(parsed.templates[0].label).toBe('a');
    });

    it('setItem Err keeps prior templates and exposes error', async () => {
      const { service } = createFakeStorage(new Map(), {
        setItem: () => Err(new Error('write failed')),
      });
      const model = proxy(new TemplatesStorageModel(service));
      await model.load();
      const before = [...model.templates];

      const result = await model.saveTemplates([
        {
          id: toCommentTemplateId('x'),
          label: 'new',
          color: 'c',
          text: 't',
        },
      ]);

      expect(result.err).toBe(true);
      expect(model.error).toBe('write failed');
      expect(model.templates).toEqual(before);
    });
  });

  describe('resetToDefaults', () => {
    it('writes defaults payload and updates state on success', async () => {
      const { service, map } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.resetToDefaults();

      expect(result.ok).toBe(true);
      expect(model.loadState).toBe('loaded');
      const raw = map.get(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY)!;
      const parsed = JSON.parse(raw) as { version: number; templates: unknown[] };
      expect(parsed.version).toBe(1);
      expect(parsed.templates).toHaveLength(DEFAULT_COMMENT_TEMPLATES.length);
      expect(model.templates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
    });

    it('returns Err when write fails', async () => {
      const { service } = createFakeStorage(new Map(), {
        setItem: () => Err(new Error('reset write blocked')),
      });
      const model = proxy(new TemplatesStorageModel(service));

      const result = await model.resetToDefaults();

      expect(result.err).toBe(true);
      expect(model.error).toBe('reset write blocked');
    });
  });

  describe('getters and getTemplate', () => {
    it('templateSummaries and hasTemplates reflect templates', async () => {
      const { service } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));
      await model.load();

      expect(model.hasTemplates).toBe(true);
      expect(model.templateSummaries).toEqual(model.templates.map(t => ({ id: t.id, label: t.label, color: t.color })));
    });

    it('getTemplate returns row or null', async () => {
      const { service } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));
      await model.load();
      const firstId = model.templates[0].id;

      expect(model.getTemplate(firstId)).toEqual(model.templates[0]);
      expect(model.getTemplate(toCommentTemplateId('missing'))).toBeNull();
    });
  });

  describe('reset', () => {
    it('clears in-memory state to initial empty', async () => {
      const { service } = createFakeStorage(new Map());
      const model = proxy(new TemplatesStorageModel(service));
      await model.load();
      expect(model.hasTemplates).toBe(true);

      model.reset();

      expect(model.templates).toEqual([]);
      expect(model.loadState).toBe('initial');
      expect(model.error).toBeNull();
      expect(model.hasTemplates).toBe(false);
    });
  });
});
