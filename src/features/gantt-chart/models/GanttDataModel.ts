import { ref } from 'valtio';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import type { JiraField, JiraIssueMapped } from 'src/infrastructure/jira/types';
import type { GanttBar, GanttScopeSettings, LoadingState, MissingDateIssue } from '../types';
import { computeBars, type GanttIssueInput } from '../utils/computeBars';
import { parseChangelog } from '../utils/parseChangelog';

export type TaskWithoutStatusHistory = {
  key: string;
  summary: string;
};

/** Empty constant returned by {@link GanttDataModel.getIssuesByKey} when nothing is loaded. */
const EMPTY_ISSUE_MAP: ReadonlyMap<string, GanttIssueInput> = new Map();

/**
 * @module GanttDataModel
 *
 * Loads related issues via {@link IJiraService.fetchSubtasks}, caches them, and derives drawable bars via {@link computeBars}.
 */
export class GanttDataModel {
  loadingState: LoadingState = 'initial';

  bars: GanttBar[] = [];

  missingDateIssues: MissingDateIssue[] = [];

  /** Loaded issues whose changelog yields no status transitions; used by status-segment warnings. */
  tasksWithoutStatusHistory: TaskWithoutStatusHistory[] = [];

  error: string | null = null;

  private cachedIssues: JiraIssueMapped[] | null = null;

  /**
   * Lookup map populated alongside {@link bars}. Stored as a plain JS Map (not part of valtio state)
   * because consumers — notably the toolbar quick-filter pipeline — only ever read it imperatively.
   * Keeping it off the proxy avoids unnecessary re-renders when the underlying issues mutate in place.
   */
  private issueInputByKey: Map<string, GanttIssueInput> = new Map();

  /**
   * Jira field metadata used by JQL-mode color rules / exclusion filters to resolve display names
   * (e.g. `Platform`) to actual storage keys (`customfield_178101`) and apply schema-aware extraction.
   *
   * Set imperatively from the container via {@link setFields} once the JiraFields store finishes loading;
   * defaults to an empty array, in which case {@link computeBars} uses its raw-tokens fallback.
   * Stored off the valtio proxy because field metadata is large and never participates in renders.
   */
  private fields: ReadonlyArray<JiraField> = [];

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
      this.tasksWithoutStatusHistory = [];
      this.issueInputByKey = new Map();
      return;
    }

    this.lastIssueKey = issueKey;
    this.cachedIssues = result.val.subtasks;
    this.applyCompute(settings);
    this.loadingState = 'loaded';
  }

  /**
   * Returns the input issues used by the most recent {@link applyCompute}, indexed by issue key.
   *
   * Used by the toolbar quick filters which need access to the raw Jira fields (resolution, status,
   * arbitrary custom fields) that {@link GanttBar} intentionally does not carry.
   */
  getIssuesByKey(): ReadonlyMap<string, GanttIssueInput> {
    if (this.issueInputByKey.size === 0) return EMPTY_ISSUE_MAP;
    return this.issueInputByKey;
  }

  recompute(settings: GanttScopeSettings): void {
    this.applyCompute(settings);
  }

  /**
   * BDD / component tests: replace the in-memory issue list (normally from {@link loadSubtasks})
   * and re-run {@link applyCompute} without a loading-state transition.
   */
  replaceCachedIssuesForTests(issues: JiraIssueMapped[]): void {
    this.cachedIssues = issues.map(i => JSON.parse(JSON.stringify(i)) as JiraIssueMapped);
  }

  /**
   * Replace the Jira field metadata used by JQL/field selectors and trigger a recompute when the
   * dataset is already loaded. Identity-compared with {@link ref} semantics so a no-op call does not
   * trigger an extra `applyCompute`.
   */
  setFields(fields: ReadonlyArray<JiraField>, settings: GanttScopeSettings | null): void {
    if (this.fields === fields) return;
    this.fields = fields;
    if (settings && this.cachedIssues?.length) {
      this.applyCompute(settings);
    }
  }

  reset(): void {
    this.loadGeneration += 1;
    this.activeAbort?.abort();
    this.activeAbort = null;
    this.loadingState = 'initial';
    this.bars = [];
    this.missingDateIssues = [];
    this.tasksWithoutStatusHistory = [];
    this.error = null;
    this.cachedIssues = null;
    this.lastIssueKey = '';
    this.issueInputByKey = new Map();
  }

  private applyCompute(settings: GanttScopeSettings): void {
    const issues = this.cachedIssues;
    if (!issues?.length) {
      this.bars = [];
      this.missingDateIssues = [];
      this.tasksWithoutStatusHistory = [];
      this.issueInputByKey = new Map();
      return;
    }
    const input: GanttIssueInput[] = issues.map(issue =>
      JSON.parse(
        JSON.stringify({
          id: issue.id,
          key: issue.key,
          fields: issue.fields,
          changelog: issue.changelog,
        })
      )
    ) as GanttIssueInput[];
    const map = new Map<string, GanttIssueInput>();
    for (const i of input) map.set(i.key, i);
    this.issueInputByKey = map;
    const { bars, missingDateIssues } = computeBars(
      input,
      settings,
      this.getNow(),
      this.lastIssueKey || undefined,
      this.fields
    );
    this.bars = bars;
    this.missingDateIssues = missingDateIssues;
    this.tasksWithoutStatusHistory = this.computeTasksWithoutStatusHistory(bars, map);
  }

  private computeTasksWithoutStatusHistory(
    bars: ReadonlyArray<GanttBar>,
    issuesByKey: ReadonlyMap<string, GanttIssueInput>
  ): TaskWithoutStatusHistory[] {
    return bars
      .filter(bar => parseChangelog(issuesByKey.get(bar.issueKey)?.changelog).length === 0)
      .map(bar => {
        const prefix = `${bar.issueKey}: `;
        const summary = bar.label.startsWith(prefix) ? bar.label.slice(prefix.length) : bar.label;
        return { key: bar.issueKey, summary };
      });
  }
}
