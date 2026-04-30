import type { Container } from 'dioma';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import { commentsEditorPageObjectToken } from 'src/infrastructure/page-objects/CommentsEditor';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { localStorageServiceToken } from 'src/infrastructure/storage/tokens';
import { CommentTemplatesEditorModel } from './Editor/models/CommentTemplatesEditorModel';
import { CommentTemplatesSettingsModel } from './Settings/models/CommentTemplatesSettingsModel';
import { TemplatesStorageModel } from './Storage/models/TemplatesStorageModel';
import {
  commentTemplatesEditorModelToken,
  commentTemplatesSettingsModelToken,
  templatesStorageModelToken,
} from './tokens';

/**
 * Lazy DI wiring for Jira Comment Templates.
 *
 * Currently registers storage/settings models. Editor model and content-level
 * `jiraCommentTemplatesPageModificationToken` registration follow dedicated integration tasks — see TODOs below.
 */
class JiraCommentTemplatesModule extends Module {
  register(container: Container): void {
    this.lazy(container, templatesStorageModelToken, c =>
      modelEntry(new TemplatesStorageModel(c.inject(localStorageServiceToken)))
    );

    this.lazy(container, commentTemplatesSettingsModelToken, c =>
      modelEntry(new CommentTemplatesSettingsModel(c.inject(templatesStorageModelToken).model))
    );

    this.lazy(container, commentTemplatesEditorModelToken, c =>
      modelEntry(
        new CommentTemplatesEditorModel(
          c.inject(templatesStorageModelToken).model,
          c.inject(commentsEditorPageObjectToken),
          c.inject(JiraServiceToken)
        )
      )
    );

    // TODO(TASK-90): register jiraCommentTemplatesPageModificationToken from content.ts (PageModification lifecycle).
  }
}

export const jiraCommentTemplatesModule = new JiraCommentTemplatesModule();
