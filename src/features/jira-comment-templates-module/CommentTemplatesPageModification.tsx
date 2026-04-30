import React from 'react';
import type { Container } from 'dioma';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import {
  commentsEditorPageObjectToken,
  type CommentEditorToolComponent,
} from 'src/infrastructure/page-objects/CommentsEditor';
import { registerIssueSettings } from 'src/issue-settings/actions/registerIssueSettings';
import { COMMENT_TEMPLATES_ATTACH_TOOLS_KEY } from './constants';
import { CommentTemplatesToolbarContainer } from './Editor/components/CommentTemplatesToolbarContainer';
import { CommentTemplatesSettingsContainer } from './Settings/components/CommentTemplatesSettingsContainer';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from './texts';

const SETTINGS_TITLE = JIRA_COMMENT_TEMPLATES_TEXTS.settingsTitle.en;
const SETTINGS_ENTRY_SELECTOR =
  '[data-jh-component="issueSettingsButton"], [data-jh-component="boardSettingsComponent"]';

type CommentTemplatesPageModificationOptions = {
  container: Container;
};

/**
 * Integrates comment templates into Jira pages:
 * - mounts the toolbar near discovered comment editors;
 * - registers the settings tab for board and issue settings panels.
 */
export class CommentTemplatesPageModification extends PageModification {
  constructor(private readonly options: CommentTemplatesPageModificationOptions) {
    super(options.container);
  }

  override getModificationId(): string {
    return 'jira-comment-templates';
  }

  apply(): void {
    const { container } = this.options;

    const SettingsTab = () => <CommentTemplatesSettingsContainer container={container} />;
    const ToolbarTool: CommentEditorToolComponent = ({ commentEditorId }) => (
      <CommentTemplatesToolbarContainer
        container={container}
        commentEditorId={commentEditorId}
        onOpenSettings={() => this.openSettingsEntry()}
      />
    );

    registerSettings({ title: SETTINGS_TITLE, component: SettingsTab });
    registerIssueSettings({ title: SETTINGS_TITLE, component: SettingsTab });

    const attachHandle = container
      .inject(commentsEditorPageObjectToken)
      .attachTools(COMMENT_TEMPLATES_ATTACH_TOOLS_KEY, ToolbarTool);

    this.sideEffects.push(() => {
      attachHandle.detach();
    });
  }

  private openSettingsEntry(): void {
    document.querySelector<HTMLElement>(SETTINGS_ENTRY_SELECTOR)?.click();
  }
}
