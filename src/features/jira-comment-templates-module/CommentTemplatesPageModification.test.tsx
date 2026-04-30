import React from 'react';
import { Container } from 'dioma';
import { Ok } from 'ts-results';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildAvatarUrlToken, searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import type { ICommentsEditorPageObject } from 'src/infrastructure/page-objects/CommentsEditor';
import { commentsEditorPageObjectToken, toCommentEditorId } from 'src/infrastructure/page-objects/CommentsEditor';
import type { ILocalStorageService } from 'src/infrastructure/storage/LocalStorageService';
import { localStorageServiceToken } from 'src/infrastructure/storage/tokens';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { registerIssueSettings } from 'src/issue-settings/actions/registerIssueSettings';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { COMMENT_TEMPLATES_ATTACH_TOOLS_KEY } from './constants';
import { CommentTemplatesPageModification } from './CommentTemplatesPageModification';
import { jiraCommentTemplatesModule } from './module';
import { commentTemplatesEditorModelToken, commentTemplatesSettingsModelToken } from './tokens';

vi.mock('src/features/board-settings/actions/registerSettings', () => ({
  registerSettings: vi.fn(),
}));

vi.mock('src/issue-settings/actions/registerIssueSettings', () => ({
  registerIssueSettings: vi.fn(),
}));

describe('CommentTemplatesPageModification', () => {
  let container: Container;
  let detach: ReturnType<typeof vi.fn>;
  let attachTools: ReturnType<typeof vi.fn>;

  const fakeLocalStorage: ILocalStorageService = {
    getItem: vi.fn(() => Ok(null)),
    setItem: vi.fn(() => Ok(undefined)),
    removeItem: vi.fn(() => Ok(undefined)),
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
    vi.clearAllMocks();

    detach = vi.fn();
    attachTools = vi.fn(() => ({ detach }));

    const fakeCommentsEditorPageObject: ICommentsEditorPageObject = {
      selectors: {} as ICommentsEditorPageObject['selectors'],
      attachTools,
      insertText: vi.fn(),
    };

    container = new Container();
    container.register({ token: localStorageServiceToken, value: fakeLocalStorage });
    container.register({ token: JiraServiceToken, value: fakeJiraService });
    container.register({ token: commentsEditorPageObjectToken, value: fakeCommentsEditorPageObject });
    container.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });
    container.register({ token: searchUsersToken, value: vi.fn(async () => []) });
    container.register({ token: buildAvatarUrlToken, value: vi.fn((login: string) => `/avatar/${login}`) });
    jiraCommentTemplatesModule.ensure(container);
  });

  it('returns stable modification id for PageModification lifecycle', () => {
    const modification = new CommentTemplatesPageModification({ container });

    expect(modification.getModificationId()).toBe('jira-comment-templates');
  });

  it('registers settings tabs and attaches toolbar tools', () => {
    const modification = new CommentTemplatesPageModification({ container });

    modification.apply();

    expect(registerSettings).toHaveBeenCalledWith({
      title: 'Comment templates',
      component: expect.any(Function),
    });
    expect(registerIssueSettings).toHaveBeenCalledWith({
      title: 'Comment templates',
      component: expect.any(Function),
    });
    expect(attachTools).toHaveBeenCalledWith(COMMENT_TEMPLATES_ATTACH_TOOLS_KEY, expect.any(Function));
  });

  it('uses the feature container for registered tab and toolbar components', () => {
    const modification = new CommentTemplatesPageModification({ container });

    modification.apply();

    const boardSetting = vi.mocked(registerSettings).mock.calls[0][0];
    const ToolbarTool = attachTools.mock.calls[0][1];

    render(
      <>
        {React.createElement(boardSetting.component)}
        {React.createElement(ToolbarTool, { commentEditorId: toCommentEditorId('editor-1') })}
      </>
    );

    expect(container.inject(commentTemplatesSettingsModelToken).model).toBeTruthy();
    expect(container.inject(commentTemplatesEditorModelToken).model).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Comment templates' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Comment templates' })).toBeInTheDocument();
  });

  it('opens the existing jira-helper settings dialog from toolbar manage button', async () => {
    const settingsButton = document.createElement('button');
    settingsButton.setAttribute('data-jh-component', 'issueSettingsButton');
    const clickSpy = vi.fn();
    settingsButton.addEventListener('click', clickSpy);
    document.body.appendChild(settingsButton);
    const modification = new CommentTemplatesPageModification({ container });

    modification.apply();

    const ToolbarTool = attachTools.mock.calls[0][1];
    render(React.createElement(ToolbarTool, { commentEditorId: toCommentEditorId('editor-1') }));
    await userEvent.click(screen.getByRole('button', { name: 'Manage templates' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('detaches attached tools on destroy', () => {
    const modification = new CommentTemplatesPageModification({ container });

    modification.apply();
    modification.clear();

    expect(detach).toHaveBeenCalledTimes(1);
  });
});
