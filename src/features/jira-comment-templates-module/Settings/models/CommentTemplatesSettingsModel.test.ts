import { describe, expect, it, vi } from 'vitest';
import { Err, Ok, type Result } from 'ts-results';
import { proxy } from 'valtio';
import { COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import type { CommentTemplate, CommentTemplateSummary, CommentTemplateId, ITemplatesStorageModel } from '../../types';
import { toCommentTemplateId } from '../../types';
import { DEFAULT_COMMENT_TEMPLATES } from '../../Storage/utils/defaultTemplates';
import { normalizeTemplates, type NormalizableCommentTemplateInput } from '../../Storage/utils/normalizeTemplates';
import {
  cloneTemplatesToEditable,
  CommentTemplatesSettingsModel,
  validateDraftTemplates,
} from './CommentTemplatesSettingsModel';

function createStorageStub(initial: CommentTemplate[]): {
  storage: ITemplatesStorageModel;
  saveTemplatesMock: ReturnType<typeof vi.fn>;
} {
  const saveTemplatesMock = vi.fn(async (templates: CommentTemplate[]) => {
    void templates;
    return Ok(undefined);
  });

  const templatesRef = { current: [...initial] };

  const storage: ITemplatesStorageModel = {
    get templates() {
      return templatesRef.current;
    },
    loadState: 'loaded',
    error: null,
    get templateSummaries(): CommentTemplateSummary[] {
      return templatesRef.current.map(t => ({ id: t.id, label: t.label, color: t.color }));
    },
    get hasTemplates(): boolean {
      return templatesRef.current.length > 0;
    },
    load: vi.fn(async () => Ok(undefined)),
    saveTemplates: async (templates: CommentTemplate[]) => {
      const result = await saveTemplatesMock(templates);
      if (result.ok) {
        templatesRef.current = normalizeTemplates(templates as NormalizableCommentTemplateInput[]);
      }
      return result;
    },
    resetToDefaults: vi.fn(async () => Ok(undefined)),
    getTemplate: (id: CommentTemplateId) => templatesRef.current.find(t => t.id === id) ?? null,
    reset: vi.fn(() => {
      templatesRef.current = [];
    }),
  };

  return { storage, saveTemplatesMock };
}

describe('validateDraftTemplates', () => {
  it('returns a file-scope error when the draft list is empty', () => {
    expect(validateDraftTemplates([])).toEqual([
      { field: 'file', message: 'At least one comment template is required.' },
    ]);
  });

  it('uses row numbers instead of internal draft ids in row validation messages', () => {
    const draft = {
      id: toCommentTemplateId('__jh-draft-0'),
      label: '',
      color: '#fff',
      text: '',
    };

    const errors = validateDraftTemplates([draft]);

    expect(errors.map(error => error.message)).toEqual([
      'Template 1: label is required.',
      'Template 1: text is required.',
    ]);
  });
});

describe('CommentTemplatesSettingsModel', () => {
  describe('initDraft', () => {
    it('clones storage templates without mutating storage references', () => {
      const stored: CommentTemplate[] = [
        {
          id: toCommentTemplateId('t1'),
          label: 'A',
          color: '#fff',
          text: 'body',
          watchers: ['u1'],
        },
      ];
      const { storage } = createStorageStub(stored);
      const model = proxy(new CommentTemplatesSettingsModel(storage));

      model.initDraft();

      expect(model.draftTemplates).toHaveLength(1);
      expect(model.draftTemplates[0]).toEqual({
        ...stored[0],
        color: '#ffffff',
      });
      expect(model.draftTemplates[0]).not.toBe(stored[0]);
      expect(model.draftTemplates[0].watchers).not.toBe(stored[0].watchers);
      expect(model.validationErrors).toHaveLength(0);
      expect(model.importError).toBeNull();
      expect(model.isDirty).toBe(false);

      model.updateTemplate(stored[0].id, { label: 'Changed' });
      expect(storage.templates[0].label).toBe('A');
      expect(model.isDirty).toBe(true);
    });
  });

  describe('CRUD', () => {
    it('addTemplate appends a unique row with defaults and isNew', () => {
      const { storage } = createStorageStub([]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();

      model.addTemplate();

      expect(model.draftTemplates).toHaveLength(1);
      expect(model.draftTemplates[0].label).toBe('Новый шаблон');
      expect(model.draftTemplates[0].color).toBe('#deebff');
      expect(model.draftTemplates[0].text.length).toBeGreaterThan(0);
      expect(model.draftTemplates[0].isNew).toBe(true);
      expect(String(model.draftTemplates[0].id)).toMatch(/^__jh-draft-/);
      expect(model.isDirty).toBe(true);

      model.addTemplate();
      expect(model.draftTemplates).toHaveLength(2);
      expect(model.draftTemplates[0].id).not.toBe(model.draftTemplates[1].id);
    });

    it('updateTemplate merges patch and normalizes watchers from comma-separated runtime string', () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();

      model.updateTemplate(row.id, {
        watchers: 'a, b' as unknown as string[],
      });

      expect(model.draftTemplates[0].watchers).toEqual(['a', 'b']);
      expect(model.isDirty).toBe(true);
    });

    it('deleteTemplate removes row', () => {
      const a: CommentTemplate = {
        id: toCommentTemplateId('a'),
        label: 'A',
        color: '#fff',
        text: 'a',
      };
      const b: CommentTemplate = {
        id: toCommentTemplateId('b'),
        label: 'B',
        color: '#000',
        text: 'b',
      };
      const { storage } = createStorageStub([a, b]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();

      model.deleteTemplate(a.id);

      expect(model.draftTemplates.map(t => t.id)).toEqual([b.id]);
      expect(model.isDirty).toBe(true);
    });
  });

  describe('importFromJsonText', () => {
    it('replaces draft only and does not call saveTemplates', async () => {
      const initial: CommentTemplate[] = [...DEFAULT_COMMENT_TEMPLATES];
      const { storage, saveTemplatesMock } = createStorageStub(initial);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();

      const imported = [
        {
          id: 'imp-1',
          label: 'Imported',
          color: '#111111',
          text: 'hello',
        },
      ];
      const jsonText = JSON.stringify(imported);

      const result = model.importFromJsonText(jsonText);

      expect(result.ok).toBe(true);
      expect(model.draftTemplates).toHaveLength(1);
      expect(model.draftTemplates[0].label).toBe('Imported');
      expect(model.isDirty).toBe(true);
      expect(saveTemplatesMock).not.toHaveBeenCalled();
      expect(storage.templates.length).toBe(initial.length);
    });

    it('sets validationErrors and importError on invalid JSON', () => {
      const { storage, saveTemplatesMock } = createStorageStub([]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));

      const result = model.importFromJsonText('{');

      expect(result.err).toBe(true);
      expect(model.validationErrors.length).toBeGreaterThan(0);
      expect(model.importError).toBeTruthy();
      expect(saveTemplatesMock).not.toHaveBeenCalled();
    });
  });

  describe('buildExportJson', () => {
    it('serializes canonical payload without isNew UI fields', () => {
      const { storage } = createStorageStub([]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.addTemplate();
      model.updateTemplate(model.draftTemplates[0].id, {
        label: 'Exp',
        color: '#222222',
        text: 'export body',
      });

      const result = model.buildExportJson();
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error('expected Ok export JSON');
      }
      const parsed = JSON.parse(result.val) as {
        version: number;
        templates: Array<Record<string, unknown>>;
      };
      expect(parsed.version).toBe(COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION);
      expect(parsed.templates).toHaveLength(1);
      expect(parsed.templates[0].isNew).toBeUndefined();
      expect(parsed.templates[0]).toEqual({
        id: String(model.draftTemplates[0].id),
        label: 'Exp',
        color: '#222222',
        text: 'export body',
      });
    });

    it('errors when draft is invalid', () => {
      const { storage } = createStorageStub([]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.addTemplate();
      model.updateTemplate(model.draftTemplates[0].id, { label: '   ' });

      const result = model.buildExportJson();
      expect(result.err).toBe(true);
      expect(model.validationErrors.length).toBeGreaterThan(0);
    });

    it('errors when draft has no templates', () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('only'),
        label: 'A',
        color: '#fff',
        text: 'a',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.deleteTemplate(row.id);

      const result = model.buildExportJson();
      expect(result.err).toBe(true);
      expect(model.validationErrors.some(e => e.field === 'file')).toBe(true);
      expect(saveTemplatesMock).not.toHaveBeenCalled();
    });
  });

  describe('saveDraft', () => {
    it('validates, saves persisted rows, clears dirty on success', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: 'B' });

      const result = await model.saveDraft();

      expect(result.ok).toBe(true);
      expect(saveTemplatesMock).toHaveBeenCalledTimes(1);
      const arg = saveTemplatesMock.mock.calls[0][0];
      expect(arg[0].label).toBe('B');
      expect(arg[0]).not.toHaveProperty('isNew');
      expect(model.isDirty).toBe(false);
      expect(model.isSaving).toBe(false);
      expect(model.validationErrors).toHaveLength(0);
    });

    it('does not save when validation fails with empty label/text/color', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: '' });

      const result = await model.saveDraft();

      expect(result.err).toBe(true);
      expect(saveTemplatesMock).not.toHaveBeenCalled();
      expect(model.isDirty).toBe(true);
      expect(validateDraftTemplates(model.draftTemplates).length).toBeGreaterThan(0);
    });

    it('keeps dirty, sets saveError and returns Err when storage save fails', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      saveTemplatesMock.mockImplementation(async () => Err(new Error('disk full')));
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: 'B' });

      const result = await model.saveDraft();

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toBe('disk full');
      expect(model.isDirty).toBe(true);
      expect(model.saveError).toBe('disk full');
      expect(model.isSaving).toBe(false);
    });

    it('clears saveError on a later successful save after a storage failure', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      saveTemplatesMock.mockImplementationOnce(async () => Err(new Error('offline')));
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: 'B' });

      const failResult = await model.saveDraft();
      expect(failResult.err).toBe(true);
      expect(model.saveError).toBe('offline');

      saveTemplatesMock.mockImplementation(async () => Ok(undefined));
      const okResult = await model.saveDraft();
      expect(okResult.ok).toBe(true);
      expect(model.saveError).toBeNull();
      expect(model.isDirty).toBe(false);
    });

    it('does not persist or clear dirty when draft is empty', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('solo'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.deleteTemplate(row.id);

      const result = await model.saveDraft();

      expect(result.err).toBe(true);
      expect(saveTemplatesMock).not.toHaveBeenCalled();
      expect(model.validationErrors.some(e => e.field === 'file')).toBe(true);
      expect(model.isDirty).toBe(true);
      expect(model.isSaving).toBe(false);
    });

    it('keeps isDirty after a stale save resolves if draft changed during in-flight save', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      let resolveSave!: (r: Result<void, Error>) => void;
      const pendingSave = new Promise<Result<void, Error>>(resolve => {
        resolveSave = resolve;
      });
      saveTemplatesMock.mockImplementation(() => pendingSave);

      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: 'First' });

      const savePromise = model.saveDraft();

      expect(model.isSaving).toBe(true);

      model.updateTemplate(row.id, { label: 'Second' });

      resolveSave!(Ok(undefined));
      const result = await savePromise;

      expect(result.ok).toBe(true);
      expect(saveTemplatesMock).toHaveBeenCalledTimes(1);
      expect(saveTemplatesMock.mock.calls[0][0][0].label).toBe('First');
      expect(model.isDirty).toBe(true);
      expect(model.draftTemplates[0].label).toBe('Second');
    });

    it('clears dirty when the color picker repeats the saved color while save is in flight', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#DEEBFF',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      let resolveSave!: (r: Result<void, Error>) => void;
      const pendingSave = new Promise<Result<void, Error>>(resolve => {
        resolveSave = resolve;
      });
      saveTemplatesMock.mockImplementation(() => pendingSave);

      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { color: '#FFEBE6' });

      const savePromise = model.saveDraft();

      model.updateTemplate(row.id, { color: '#FFEBE6' });

      resolveSave!(Ok(undefined));
      const result = await savePromise;

      expect(result.ok).toBe(true);
      expect(model.isDirty).toBe(false);
      expect(model.draftTemplates[0].color).toBe('#ffebe6');
      expect(storage.templates[0].color).toBe('#ffebe6');
    });

    it('clears dirty when save completes despite duplicate picker patches differing only by hex letter case', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#DEEBFF',
        text: 'body',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      let resolveSave!: (r: Result<void, Error>) => void;
      const pendingSave = new Promise<Result<void, Error>>(resolve => {
        resolveSave = resolve;
      });
      saveTemplatesMock.mockImplementation(() => pendingSave);

      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { color: '#FFEBE6' });

      const savePromise = model.saveDraft();

      model.updateTemplate(row.id, { color: '#ffebe6' });

      resolveSave!(Ok(undefined));
      const result = await savePromise;

      expect(result.ok).toBe(true);
      expect(model.isDirty).toBe(false);
      expect(model.draftTemplates[0].color).toBe('#ffebe6');
      expect(storage.templates[0].color).toBe('#ffebe6');
    });

    it('resyncs draft from storage after save so trimmed fields/watchers match persisted canonical data and export', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#ffffff',
        text: 'body',
      };
      const { storage } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, {
        label: '  padded-label  ',
        text: '  padded-text  ',
        watchers: '  w1 , w2  ' as unknown as string[],
      });

      await model.saveDraft();

      expect(model.isDirty).toBe(false);
      expect(model.draftTemplates[0].label).toBe('padded-label');
      expect(model.draftTemplates[0].text).toBe('padded-text');
      expect(model.draftTemplates[0].watchers).toEqual(['w1', 'w2']);

      const exportResult = model.buildExportJson();
      expect(exportResult.ok).toBe(true);
      if (!exportResult.ok) {
        throw new Error('expected Ok export JSON');
      }
      const parsed = JSON.parse(exportResult.val) as {
        version: number;
        templates: Array<Record<string, unknown>>;
      };
      expect(parsed.templates[0]).toMatchObject({
        id: String(row.id),
        label: 'padded-label',
        color: '#ffffff',
        text: 'padded-text',
        watchers: ['w1', 'w2'],
      });
      expect(storage.templates[0].label).toBe('padded-label');
    });
  });

  describe('discardDraft', () => {
    it('reverts draft from storage and clears errors', () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.updateTemplate(row.id, { label: 'Z' });
      model.importFromJsonText('not-json');

      model.discardDraft();

      expect(model.draftTemplates).toEqual(cloneTemplatesToEditable([row]));
      expect(model.validationErrors).toHaveLength(0);
      expect(model.importError).toBeNull();
      expect(model.isDirty).toBe(false);
    });
  });

  describe('resetDraftToDefaults', () => {
    it('replaces draft with defaults and does not persist', async () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('only-one'),
        label: 'Solo',
        color: '#fff',
        text: 'solo',
      };
      const { storage, saveTemplatesMock } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();

      model.resetDraftToDefaults();

      expect(model.draftTemplates.map(t => t.id)).toEqual(DEFAULT_COMMENT_TEMPLATES.map(t => t.id));
      expect(model.isDirty).toBe(true);
      expect(model.importError).toBeNull();
      expect(saveTemplatesMock).not.toHaveBeenCalled();
      expect(storage.templates[0].id).toBe(row.id);
    });
  });

  describe('reset', () => {
    it('clears model state to empty initial values', () => {
      const row: CommentTemplate = {
        id: toCommentTemplateId('t1'),
        label: 'A',
        color: '#fff',
        text: 'body',
      };
      const { storage } = createStorageStub([row]);
      const model = proxy(new CommentTemplatesSettingsModel(storage));
      model.initDraft();
      model.addTemplate();

      model.reset();

      expect(model.draftTemplates).toEqual([]);
      expect(model.validationErrors).toEqual([]);
      expect(model.importError).toBeNull();
      expect(model.isSaving).toBe(false);
      expect(model.isDirty).toBe(false);
    });
  });
});
