import { Err, Ok, type Result } from 'ts-results';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import type { ICommentsEditorPageObject } from 'src/infrastructure/page-objects/CommentsEditor';
import type {
  AddWatcherItemResult,
  AddWatchersResult,
  CommentTemplateId,
  ICommentTemplatesEditorModel,
  InsertTemplateRequest,
  InsertTemplateResult,
  ITemplatesStorageModel,
} from '../../types';

/**
 * Trims watcher login strings and drops empty entries (no dedupe / existence checks).
 */
function normalizeWatcherUsernames(watchers: string[] | undefined): string[] {
  if (watchers == null || watchers.length === 0) {
    return [];
  }
  return watchers.map(w => w.trim()).filter(w => w.length > 0);
}

function aggregateWatcherStatus(items: AddWatcherItemResult[]): AddWatchersResult['status'] {
  const added = items.filter(i => i.status === 'added').length;
  const failed = items.filter(i => i.status === 'failed').length;
  if (failed === 0) {
    return 'success';
  }
  if (added === 0) {
    return 'failed';
  }
  return 'partial';
}

/**
 * @module CommentTemplatesEditorModel
 *
 * Orchestrates template text insertion via {@link ICommentsEditorPageObject} and optional
 * {@link IJiraService.addWatcher} calls. No DOM or localStorage — inject deps only.
 */
export class CommentTemplatesEditorModel implements ICommentTemplatesEditorModel {
  pendingTemplateIds: Record<CommentTemplateId, boolean> = {};

  /** In-flight {@link insertTemplate} calls per template id; public pending stays true until this reaches 0. */
  private pendingCounts: Record<string, number> = {};

  constructor(
    private readonly storageModel: ITemplatesStorageModel,
    private readonly commentsEditorPageObject: ICommentsEditorPageObject,
    private readonly jiraService: IJiraService
  ) {}

  private beginPending(templateId: CommentTemplateId): void {
    const key = String(templateId);
    this.pendingCounts[key] = (this.pendingCounts[key] ?? 0) + 1;
    this.pendingTemplateIds[templateId] = true;
  }

  private endPending(templateId: CommentTemplateId): void {
    const key = String(templateId);
    let n = this.pendingCounts[key] ?? 0;
    if (n <= 0) {
      return;
    }
    n -= 1;
    if (n === 0) {
      delete this.pendingCounts[key];
      delete this.pendingTemplateIds[templateId];
    } else {
      this.pendingCounts[key] = n;
    }
  }

  async insertTemplate(request: InsertTemplateRequest): Promise<Result<InsertTemplateResult, Error>> {
    const { commentEditorId, templateId } = request;
    this.beginPending(templateId);
    try {
      const template = this.storageModel.getTemplate(templateId);
      if (!template) {
        return Err(new Error(`Comment template not found: ${String(templateId)}`));
      }

      const inserted = this.commentsEditorPageObject.insertText(commentEditorId, template.text);
      if (inserted.err) {
        return Err(inserted.val);
      }

      const { issueKey } = inserted.val;
      const watcherUsernames = normalizeWatcherUsernames(template.watchers);

      if (watcherUsernames.length === 0) {
        return Ok({
          templateId,
          inserted: true,
          watchersResult: {
            issueKey,
            status: 'skipped',
            reason: 'empty-watchers',
            items: [],
          },
        });
      }

      if (issueKey == null) {
        return Ok({
          templateId,
          inserted: true,
          watchersResult: {
            issueKey: null,
            status: 'skipped',
            reason: 'missing-issue-key',
            items: [],
          },
        });
      }

      const items: AddWatcherItemResult[] = [];
      for (const username of watcherUsernames) {
        const watcherResult = await this.jiraService.addWatcher(issueKey, username);
        if (watcherResult.ok) {
          items.push({ username, status: 'added' });
        } else {
          items.push({
            username,
            status: 'failed',
            errorMessage: watcherResult.val.message,
          });
        }
      }

      const watchersResult: AddWatchersResult = {
        issueKey,
        status: aggregateWatcherStatus(items),
        items,
      };

      return Ok({
        templateId,
        inserted: true,
        watchersResult,
      });
    } finally {
      this.endPending(templateId);
    }
  }

  reset(): void {
    this.pendingTemplateIds = {};
    this.pendingCounts = {};
  }
}
