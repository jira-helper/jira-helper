import { describe, expect, it, vi } from 'vitest';
import { Err, Ok } from 'ts-results';
import { toCommentEditorId } from 'src/infrastructure/page-objects/CommentsEditor';
import type { ICommentsEditorPageObject } from 'src/infrastructure/page-objects/CommentsEditor';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import type { CommentTemplate, CommentTemplateId, CommentTemplateSummary, ITemplatesStorageModel } from '../../types';
import { toCommentTemplateId } from '../../types';
import { CommentTemplatesEditorModel } from './CommentTemplatesEditorModel';

function createStorageWithTemplates(templates: CommentTemplate[]): ITemplatesStorageModel {
  return {
    templates,
    loadState: 'loaded',
    error: null,
    get templateSummaries(): CommentTemplateSummary[] {
      return templates.map(t => ({ id: t.id, label: t.label, color: t.color }));
    },
    get hasTemplates(): boolean {
      return templates.length > 0;
    },
    load: vi.fn(async () => Ok(undefined)),
    saveTemplates: vi.fn(async () => Ok(undefined)),
    resetToDefaults: vi.fn(async () => Ok(undefined)),
    getTemplate: (id: CommentTemplateId) => templates.find(t => t.id === id) ?? null,
    reset: vi.fn(),
  };
}

function baseTemplate(overrides: Partial<CommentTemplate> = {}): CommentTemplate {
  return {
    id: toCommentTemplateId('tpl-1'),
    label: 'L',
    color: '#000',
    text: 'hello',
    ...overrides,
  };
}

describe('CommentTemplatesEditorModel', () => {
  it('inserts text and skips watchers when list is empty; clears pending', async () => {
    const tpl = baseTemplate({ watchers: undefined });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'PROJ-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn();
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };

    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);
    const editorId = toCommentEditorId('ed-1');

    const result = await model.insertTemplate({ commentEditorId: editorId, templateId: tpl.id });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.inserted).toBe(true);
    expect(result.val.watchersResult).toEqual({
      issueKey: 'PROJ-1',
      status: 'skipped',
      reason: 'empty-watchers',
      items: [],
    });
    expect(insertText).toHaveBeenCalledWith(editorId, 'hello');
    expect(addWatcher).not.toHaveBeenCalled();
    expect(model.pendingTemplateIds).not.toHaveProperty(tpl.id);
  });

  it('returns Err when template is missing; no insert or addWatcher; clears pending', async () => {
    const storage = createStorageWithTemplates([]);
    const insertText = vi.fn();
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn();
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);
    const missingId = toCommentTemplateId('missing');

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: missingId,
    });

    expect(result.err).toBe(true);
    if (!result.err) {
      throw new Error('expected Err');
    }
    expect(result.val.message).toContain('missing');
    expect(insertText).not.toHaveBeenCalled();
    expect(addWatcher).not.toHaveBeenCalled();
    expect(model.pendingTemplateIds).not.toHaveProperty(missingId);
  });

  it('returns Err on insertText failure; no addWatcher; clears pending', async () => {
    const tpl = baseTemplate({ watchers: ['u1'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertErr = new Error('editor missing');
    const insertText = vi.fn(() => Err(insertErr));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn();
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.err).toBe(true);
    if (!result.err) {
      throw new Error('expected Err');
    }
    expect(result.val).toBe(insertErr);
    expect(addWatcher).not.toHaveBeenCalled();
    expect(model.pendingTemplateIds).not.toHaveProperty(tpl.id);
  });

  it('skips watcher REST calls when issueKey is null', async () => {
    const tpl = baseTemplate({ watchers: ['alice'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: null }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn();
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.watchersResult).toEqual({
      issueKey: null,
      status: 'skipped',
      reason: 'missing-issue-key',
      items: [],
    });
    expect(addWatcher).not.toHaveBeenCalled();
  });

  it('aggregates success when all watchers are added', async () => {
    const tpl = baseTemplate({ watchers: ['a', 'b'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn(async () => Ok(undefined));
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.watchersResult?.status).toBe('success');
    expect(addWatcher).toHaveBeenCalledTimes(2);
    expect(addWatcher).toHaveBeenNthCalledWith(1, 'K-1', 'a');
    expect(addWatcher).toHaveBeenNthCalledWith(2, 'K-1', 'b');
  });

  it('aggregates partial when some watchers fail', async () => {
    const tpl = baseTemplate({ watchers: ['a', 'b', 'c'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn(async (_key: string, user: string) => {
      if (user === 'b') {
        return Err(new Error('nope'));
      }
      return Ok(undefined);
    });
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.watchersResult?.status).toBe('partial');
    expect(addWatcher).toHaveBeenCalledTimes(3);
    expect(result.val.watchersResult?.items).toEqual([
      { username: 'a', status: 'added' },
      { username: 'b', status: 'failed', errorMessage: 'nope' },
      { username: 'c', status: 'added' },
    ]);
  });

  it('aggregates failed when every watcher call fails', async () => {
    const tpl = baseTemplate({ watchers: ['a', 'b'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn(async () => Err(new Error('fail')));
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.watchersResult?.status).toBe('failed');
    expect(addWatcher).toHaveBeenCalledTimes(2);
  });

  it('trims watcher values and ignores empty strings (treated as empty watchers)', async () => {
    const tpl = baseTemplate({ watchers: ['  ', '\t', ''] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn();
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const result = await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('expected Ok');
    }
    expect(result.val.watchersResult?.reason).toBe('empty-watchers');
    expect(addWatcher).not.toHaveBeenCalled();
  });

  it('trims meaningful watcher logins and still adds them', async () => {
    const tpl = baseTemplate({ watchers: ['  alice  ', 'bob'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };
    const addWatcher = vi.fn(async () => Ok(undefined));
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    await model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    expect(addWatcher).toHaveBeenNthCalledWith(1, 'K-1', 'alice');
    expect(addWatcher).toHaveBeenNthCalledWith(2, 'K-1', 'bob');
  });

  it('sets pendingTemplateIds during async watcher work until completion', async () => {
    const tpl = baseTemplate({ watchers: ['slow'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };

    const { promise: gate, resolve: openGate } = Promise.withResolvers<void>();
    const addWatcher = vi.fn(async () => {
      await gate;
      return Ok(undefined);
    });
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);

    const p = model.insertTemplate({
      commentEditorId: toCommentEditorId('ed-1'),
      templateId: tpl.id,
    });

    await vi.waitFor(() => {
      expect(model.pendingTemplateIds[tpl.id]).toBe(true);
    });
    openGate();
    await p;
    expect(model.pendingTemplateIds[tpl.id]).toBeUndefined();
  });

  it('keeps pending true until all concurrent insertTemplate calls for the same templateId finish', async () => {
    const tpl = baseTemplate({ watchers: ['u'] });
    const storage = createStorageWithTemplates([tpl]);
    const insertText = vi.fn(() => Ok({ issueKey: 'K-1' }));
    const commentsPo: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools: vi.fn(),
      insertText,
    };

    const { promise: gate1, resolve: resolve1 } = Promise.withResolvers<void>();
    const { promise: gate2, resolve: resolve2 } = Promise.withResolvers<void>();
    let watcherCall = 0;
    const addWatcher = vi.fn(async () => {
      watcherCall += 1;
      if (watcherCall === 1) {
        await gate1;
      } else {
        await gate2;
      }
      return Ok(undefined);
    });
    const jira: IJiraService = {
      fetchJiraIssue: vi.fn(),
      fetchSubtasks: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn(),
      addWatcher,
    };
    const model = new CommentTemplatesEditorModel(storage, commentsPo, jira);
    const editorId = toCommentEditorId('ed-1');

    const p1 = model.insertTemplate({ commentEditorId: editorId, templateId: tpl.id });
    const p2 = model.insertTemplate({ commentEditorId: editorId, templateId: tpl.id });

    await vi.waitFor(() => {
      expect(addWatcher).toHaveBeenCalledTimes(2);
    });
    expect(model.pendingTemplateIds[tpl.id]).toBe(true);

    resolve1();
    await p1;
    expect(model.pendingTemplateIds[tpl.id]).toBe(true);

    resolve2();
    await p2;
    expect(model.pendingTemplateIds[tpl.id]).toBeUndefined();
  });

  it('reset clears pending map', () => {
    const model = new CommentTemplatesEditorModel(
      createStorageWithTemplates([]),
      { selectors: {} as ICommentsEditorPageObject['selectors'], attachTools: vi.fn(), insertText: vi.fn() },
      {
        fetchJiraIssue: vi.fn(),
        fetchSubtasks: vi.fn(),
        getExternalIssues: vi.fn(),
        getProjectFields: vi.fn(),
        getIssueLinkTypes: vi.fn(),
        getStatuses: vi.fn(),
        addWatcher: vi.fn(),
      }
    );
    const id = toCommentTemplateId('x');
    model.pendingTemplateIds[id] = true;
    model.reset();
    expect(model.pendingTemplateIds).toEqual({});
  });
});
