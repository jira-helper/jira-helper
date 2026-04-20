import { ref } from 'valtio';
import type { Logger } from 'src/shared/Logger';
import type { IJiraService } from 'src/shared/jira/jiraService';
import type { JiraIssueMapped } from 'src/shared/jira/types';
import type { GanttBar, GanttScopeSettings, LoadingState, MissingDateIssue } from '../types';
import { computeBars, type GanttIssueInput } from '../utils/computeBars';

/**
 * @module GanttDataModel
 *
 * Loads related issues via {@link IJiraService.fetchSubtasks}, caches them, and derives drawable bars via {@link computeBars}.
 */
export class GanttDataModel {
  loadingState: LoadingState = 'initial';

  bars: GanttBar[] = [];

  missingDateIssues: MissingDateIssue[] = [];

  error: string | null = null;

  private cachedIssues: JiraIssueMapped[] | null = null;

  /** Issue key from the last successful {@link loadSubtasks} (for relation filtering in {@link computeBars}). */
  private lastIssueKey = '';

  private loadGeneration = 0;

  private activeAbort: AbortController | null = null;

  constructor(
    private jiraService: IJiraService,
    private logger: Logger,
    private getNow: () => Date = () => new Date()
  ) {}

  async loadSubtasks(issueKey: string, settings: GanttScopeSettings): Promise<void> {
    const gen = ++this.loadGeneration;
    this.activeAbort?.abort();
    const ac = ref(new AbortController());
    this.activeAbort = ac;

    this.loadingState = 'loading';
    this.error = null;

    const result = await this.jiraService.fetchSubtasks(issueKey, ac.signal);

    if (gen !== this.loadGeneration) {
      return;
    }

    if (result.err) {
      const log = this.logger.getPrefixedLog('GanttDataModel.loadSubtasks');
      log(`Failed to load subtasks for ${issueKey}: ${result.val.message}`, 'error');
      this.loadingState = 'error';
      this.error = result.val.message;
      this.cachedIssues = null;
      this.lastIssueKey = '';
      this.bars = [];
      this.missingDateIssues = [];
      return;
    }

    this.lastIssueKey = issueKey;
    this.cachedIssues = result.val.subtasks;
    this.applyCompute(settings);
    this.loadingState = 'loaded';
  }

  recompute(settings: GanttScopeSettings): void {
    this.applyCompute(settings);
  }

  reset(): void {
    this.loadGeneration += 1;
    this.activeAbort?.abort();
    this.activeAbort = null;
    this.loadingState = 'initial';
    this.bars = [];
    this.missingDateIssues = [];
    this.error = null;
    this.cachedIssues = null;
    this.lastIssueKey = '';
  }

  private applyCompute(settings: GanttScopeSettings): void {
    const issues = this.cachedIssues;
    if (!issues?.length) {
      this.bars = [];
      this.missingDateIssues = [];
      return;
    }
    const input: GanttIssueInput[] = issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      fields: issue.fields,
      changelog: issue.changelog,
    }));
    const { bars, missingDateIssues } = computeBars(input, settings, this.getNow(), this.lastIssueKey || undefined);
    this.bars = bars;
    this.missingDateIssues = missingDateIssues;
  }
}
