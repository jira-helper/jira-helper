import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { Ok } from 'ts-results';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import type { ICommentsEditorPageObject } from 'src/infrastructure/page-objects/CommentsEditor';
import { commentsEditorPageObjectToken } from 'src/infrastructure/page-objects/CommentsEditor';
import type { ILocalStorageService } from 'src/infrastructure/storage/LocalStorageService';
import { localStorageServiceToken } from 'src/infrastructure/storage/tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from './constants';
import { jiraCommentTemplatesModule } from './module';
import { templatesStorageModelToken } from './tokens';
import { toCommentTemplateId } from './types';

describe('jiraCommentTemplatesModule diagnostic callback', () => {
  let container: Container;

  const fakeLocalStorage: ILocalStorageService = {
    getItem: vi.fn(() => Ok(null)),
    setItem: vi.fn(() => Ok(undefined)),
    removeItem: vi.fn(() => Ok(undefined)),
  };
  const fakeCommentsEditorPageObject: ICommentsEditorPageObject = {
    selectors: {} as ICommentsEditorPageObject['selectors'],
    attachTools: vi.fn(),
    insertText: vi.fn(),
  };
  const fakeJiraService: IJiraService = {
    fetchJiraIssue: vi.fn(),
    fetchSubtasks: vi.fn(),
    getExternalIssues: vi.fn(),
    getProjectFields: vi.fn(),
    getIssueLinkTypes: vi.fn(),
    getStatuses: vi.fn(),
    addWatcher: vi.fn(),
  };

  beforeEach(() => {
    container = new Container();
    container.register({ token: localStorageServiceToken, value: fakeLocalStorage });
    container.register({ token: commentsEditorPageObjectToken, value: fakeCommentsEditorPageObject });
    container.register({ token: JiraServiceToken, value: fakeJiraService });
    container.register({ token: loggerToken, value: new Logger() });

    diagnosticModule.ensure(container);
    jiraCommentTemplatesModule.ensure(container);
  });

  it('registers jira-comment-templates-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('jira-comment-templates-module');
  });

  it('returns §5.3 payload from storage model state without load/save side effects', () => {
    const { model: storageModel } = container.inject(templatesStorageModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    storageModel.templates = [
      {
        id: toCommentTemplateId('tpl-a'),
        label: 'A',
        color: '#fff',
        text: 'text',
      },
      {
        id: toCommentTemplateId('tpl-b'),
        label: 'B',
        color: '#000',
        text: 'other',
      },
    ];
    storageModel.enabled = false;
    storageModel.loadState = 'loaded';

    const loadSpy = vi.spyOn(storageModel, 'load');
    const saveTemplatesSpy = vi.spyOn(storageModel, 'saveTemplates');
    const setEnabledSpy = vi.spyOn(storageModel, 'setEnabled');
    const getDiagnosticSnapshotSpy = vi.spyOn(storageModel, 'getDiagnosticSnapshot');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['jira-comment-templates-module'];

    expect(loadSpy).not.toHaveBeenCalled();
    expect(saveTemplatesSpy).not.toHaveBeenCalled();
    expect(setEnabledSpy).not.toHaveBeenCalled();
    expect(getDiagnosticSnapshotSpy).toHaveBeenCalled();
    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: {
          commentTemplates: {
            version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
            templatesCount: 2,
            enabled: false,
          },
        },
      },
      runtime: null,
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('returns initial storage summary when templates are not loaded', () => {
    const { model: storageModel } = container.inject(templatesStorageModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(storageModel.loadState).toBe('initial');
    expect(storageModel.templates).toEqual([]);
    expect(storageModel.enabled).toBe(true);

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['jira-comment-templates-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: {
          commentTemplates: {
            version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
            templatesCount: 0,
            enabled: true,
          },
        },
      },
      runtime: null,
    });
  });
});
