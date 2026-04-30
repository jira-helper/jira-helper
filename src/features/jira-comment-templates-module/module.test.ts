import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'dioma';
import { Ok } from 'ts-results';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import type { ICommentsEditorPageObject } from 'src/infrastructure/page-objects/CommentsEditor';
import { commentsEditorPageObjectToken } from 'src/infrastructure/page-objects/CommentsEditor';
import type { ILocalStorageService } from 'src/infrastructure/storage/LocalStorageService';
import { localStorageServiceToken } from 'src/infrastructure/storage/tokens';
import { jiraCommentTemplatesModule } from './module';
import { CommentTemplatesEditorModel } from './Editor/models/CommentTemplatesEditorModel';
import { CommentTemplatesSettingsModel } from './Settings/models/CommentTemplatesSettingsModel';
import { TemplatesStorageModel } from './Storage/models/TemplatesStorageModel';
import {
  commentTemplatesEditorModelToken,
  commentTemplatesSettingsModelToken,
  jiraCommentTemplatesPageModificationToken,
  templatesStorageModelToken,
} from './tokens';

/** Minimal `PageModification` subclass to assert `jiraCommentTemplatesPageModificationToken` stays `PageModification`-typed. */
class TestCommentTemplatesPageModification extends PageModification {
  override getModificationId(): string {
    return 'test-jira-comment-templates';
  }
}

describe('jiraCommentTemplatesModule', () => {
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
  });

  it('ensure registers and resolves templatesStorageModelToken', () => {
    jiraCommentTemplatesModule.ensure(container);

    const { model, useModel } = container.inject(templatesStorageModelToken);

    expect(model).toBeInstanceOf(TemplatesStorageModel);
    expect(typeof useModel).toBe('function');
    expect(model.loadState).toBe('initial');
  });

  it('templatesStorageModelToken resolves to the same model instance on repeated injects', () => {
    jiraCommentTemplatesModule.ensure(container);

    const first = container.inject(templatesStorageModelToken);
    const second = container.inject(templatesStorageModelToken);

    expect(first.model).toBe(second.model);
  });

  it('ensure registers and resolves commentTemplatesSettingsModelToken', () => {
    jiraCommentTemplatesModule.ensure(container);

    const { model, useModel } = container.inject(commentTemplatesSettingsModelToken);

    expect(model).toBeInstanceOf(CommentTemplatesSettingsModel);
    expect(typeof useModel).toBe('function');
  });

  it('ensure registers and resolves commentTemplatesEditorModelToken', () => {
    jiraCommentTemplatesModule.ensure(container);

    const { model, useModel } = container.inject(commentTemplatesEditorModelToken);

    expect(model).toBeInstanceOf(CommentTemplatesEditorModel);
    expect(typeof useModel).toBe('function');
  });

  it('exposes stable token names for future models and PageModification', () => {
    expect(templatesStorageModelToken.name).toBe('jira-comment-templates/templatesStorageModel');
    expect(commentTemplatesSettingsModelToken.name).toBe('jira-comment-templates/settingsModel');
    expect(commentTemplatesEditorModelToken.name).toBe('jira-comment-templates/editorModel');
    expect(jiraCommentTemplatesPageModificationToken.name).toBe('jira-comment-templates/pageModification');
  });

  it('jiraCommentTemplatesPageModificationToken resolves a registered PageModification instance', () => {
    jiraCommentTemplatesModule.ensure(container);

    const pageModification = new TestCommentTemplatesPageModification(container);
    container.register({ token: jiraCommentTemplatesPageModificationToken, value: pageModification });

    const resolved = container.inject(jiraCommentTemplatesPageModificationToken);

    expect(resolved).toBe(pageModification);
    expect(resolved).toBeInstanceOf(PageModification);
  });
});
