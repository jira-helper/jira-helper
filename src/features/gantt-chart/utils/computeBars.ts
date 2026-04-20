import { mapStatusCategoryColorToProgressStatus } from 'src/features/sub-tasks-progress/colorSchemas';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import type { ExternalIssueMapped } from 'src/shared/jira/types';
import type {
  BarStatusCategory,
  BarStatusSection,
  ColorRule,
  ComputeBarsResult,
  DateMapping,
  ExclusionFilter,
  GanttBar,
  GanttScopeSettings,
  MissingDateIssue,
} from '../types';
import { parseChangelog, type JiraChangelogInput } from './parseChangelog';

/**
 * Minimal issue shape for Gantt bar computation: raw `fields` bag, optional changelog for status mappings.
 */
export type GanttIssueInput = {
  id: string;
  key: string;
  fields: Record<string, unknown> & {
    summary?: string;
    status?: {
      name?: string;
      statusCategory?: {
        key?: string;
        colorName?: string;
      };
    };
    parent?: { key?: string; id?: string } | null;
    issuelinks?: Array<{
      type?: { id?: string; name?: string };
      inwardIssue?: { key?: string };
      outwardIssue?: { key?: string };
    }> | null;
  };
  changelog?: JiraChangelogInput | null;
};

type IssueRelation = 'subtask' | 'epicChild' | 'issueLink';

function isLinkedToRoot(issue: GanttIssueInput, rootIssueKey: string): boolean {
  const links = issue.fields.issuelinks;
  if (!links?.length) return false;
  for (const link of links) {
    if (link.inwardIssue?.key === rootIssueKey || link.outwardIssue?.key === rootIssueKey) {
      return true;
    }
  }
  return false;
}

function epicFieldPointsToRoot(val: unknown, rootIssueKey: string): boolean {
  if (val === rootIssueKey) return true;
  if (val && typeof val === 'object' && val !== null && 'key' in val) {
    const k = (val as { key?: string }).key;
    if (k === rootIssueKey) return true;
  }
  return false;
}

/**
 * Classify how an issue relates to the chart root (for inclusion flags).
 * Order: subtask (parent) → epic child (Epic Link–style custom field) → issue link / other.
 */
function classifyRelation(issue: GanttIssueInput, rootIssueKey: string): IssueRelation {
  const { parent } = issue.fields;
  if (parent && (parent.key === rootIssueKey || parent.id === rootIssueKey)) {
    return 'subtask';
  }

  for (const [fieldId, val] of Object.entries(issue.fields)) {
    if (!fieldId.startsWith('customfield_')) continue;
    if (epicFieldPointsToRoot(val, rootIssueKey)) {
      return 'epicChild';
    }
  }

  if (isLinkedToRoot(issue, rootIssueKey)) {
    return 'issueLink';
  }

  // Jira payloads in the subtasks list often omit `parent`; treat as subtask unless linked via issuelinks.
  return 'subtask';
}

function parseFieldDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw;
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function findFirstTransitionToStatus(
  changelog: JiraChangelogInput | null | undefined,
  statusName: string
): Date | null {
  const target = statusName.trim();
  if (!target) return null;
  const transitions = parseChangelog(changelog);
  for (const t of transitions) {
    if (t.toStatus.trim() === target) return t.timestamp;
  }
  return null;
}

function resolveMappingDate(mapping: DateMapping, issue: GanttIssueInput): Date | null {
  if (mapping.source === 'dateField') {
    const id = mapping.fieldId;
    if (!id) return null;
    return parseFieldDate(issue.fields[id]);
  }
  if (mapping.source === 'statusTransition') {
    const name = mapping.statusName;
    if (!name) return null;
    return findFirstTransitionToStatus(issue.changelog, name);
  }
  return null;
}

function normalizeComparableFieldValue(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    if (r.value !== undefined && r.value !== null) return String(r.value);
    if (typeof r.name === 'string') return r.name;
  }
  return '';
}

function createFieldGetter(issue: GanttIssueInput): (fieldName: string) => unknown {
  return (fieldName: string) => {
    const lower = fieldName.toLowerCase();
    if (issue.fields[lower] !== undefined) return normalizeComparableFieldValue(issue.fields[lower]);
    for (const [key, val] of Object.entries(issue.fields)) {
      if (key.toLowerCase() === lower) return normalizeComparableFieldValue(val);
    }
    return undefined;
  };
}

function matchesSingleFilter(issue: GanttIssueInput, filter: ExclusionFilter): boolean {
  if (filter.mode === 'jql') {
    if (!filter.jql || filter.jql.trim() === '') return false;
    try {
      const matcher = parseJql(filter.jql);
      return matcher(createFieldGetter(issue));
    } catch {
      return false;
    }
  }
  if (filter.mode !== 'field') return false;
  const { fieldId } = filter;
  const expected = filter.value;
  if (!fieldId || expected === undefined) return false;
  return normalizeComparableFieldValue(issue.fields[fieldId]) === expected;
}

function isExcludedByFilters(issue: GanttIssueInput, settings: GanttScopeSettings): boolean {
  if (settings.hideCompletedTasks) {
    const catKey = issue.fields.status?.statusCategory?.key;
    if (catKey === 'done') return true;
  }

  const filters = settings.exclusionFilters;
  if (!filters || filters.length === 0) return false;
  return filters.some(f => matchesSingleFilter(issue, f));
}

function formatFieldForDisplay(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    if (typeof r.displayName === 'string') return r.displayName;
    if (typeof r.name === 'string') return r.name;
    if (r.value !== undefined && r.value !== null) return String(r.value);
  }
  return '';
}

function buildTooltipFields(issue: GanttIssueInput, fieldIds: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of fieldIds) {
    out[id] = formatFieldForDisplay(issue.fields[id]);
  }
  return out;
}

function mapJiraCategoryKeyToBar(key: string | undefined): BarStatusCategory | null {
  if (key === 'new') return 'todo';
  if (key === 'indeterminate') return 'inProgress';
  if (key === 'done') return 'done';
  return null;
}

function resolveStatusCategory(issue: GanttIssueInput): BarStatusCategory {
  const meta = issue.fields.status?.statusCategory;
  if (!meta) return 'todo';

  const colorName = meta.colorName as ExternalIssueMapped['statusColor'] | undefined;
  if (colorName) {
    const fromColor = mapStatusCategoryColorToProgressStatus(colorName);
    if (fromColor) return fromColor;
  }

  const fromKey = mapJiraCategoryKeyToBar(meta.key);
  if (fromKey) return fromKey;

  return 'todo';
}

function issueSummary(issue: GanttIssueInput): string {
  return typeof issue.fields.summary === 'string' ? issue.fields.summary : '';
}

/**
 * Returns the color from the first matching rule (top-down). JQL rules use {@link parseJql}.
 */
export function matchColorRule(issue: GanttIssueInput, rules: ColorRule[]): string | undefined {
  for (const rule of rules) {
    if (rule.selector.mode === 'jql') {
      if (!rule.selector.jql || rule.selector.jql.trim() === '') continue;
      try {
        const matcher = parseJql(rule.selector.jql);
        if (matcher(createFieldGetter(issue))) return rule.color;
      } catch {
        continue;
      }
      continue;
    }
    if (rule.selector.mode !== 'field') continue;
    const { fieldId } = rule.selector;
    const expected = rule.selector.value;
    if (!fieldId || expected === undefined) continue;
    if (normalizeComparableFieldValue(issue.fields[fieldId]) === expected) {
      return rule.color;
    }
  }
  return undefined;
}

/**
 * Turn loaded issues plus scope settings into drawable bars and issues that cannot be placed on the timeline.
 *
 * @param subtasks Issues in Jira API shape (fields + optional changelog).
 * @param settings Resolved Gantt scope settings (date mappings, label, tooltips, exclusion).
 * @param now Injected clock for open-ended bars and tests; defaults to `new Date()`.
 * @param rootIssueKey When set, filters issues by inclusion flags (subtasks / epic children / issue links).
 */
export function computeBars(
  subtasks: GanttIssueInput[],
  settings: GanttScopeSettings,
  now: Date = new Date(),
  rootIssueKey?: string
): ComputeBarsResult {
  const bars: GanttBar[] = [];
  const missingDateIssues: MissingDateIssue[] = [];

  for (const issue of subtasks) {
    if (rootIssueKey) {
      const relation = classifyRelation(issue, rootIssueKey);
      if (relation === 'subtask' && !settings.includeSubtasks) continue;
      if (relation === 'epicChild' && !settings.includeEpicChildren) continue;
      if (relation === 'issueLink' && !settings.includeIssueLinks) continue;
    }

    if (isExcludedByFilters(issue, settings)) {
      missingDateIssues.push({
        issueKey: issue.key,
        summary: issueSummary(issue),
        reason: 'excluded',
      });
      continue;
    }

    const startDate = resolveMappingDate(settings.startMapping, issue);
    const endDate = resolveMappingDate(settings.endMapping, issue);

    if (!startDate && !endDate) {
      missingDateIssues.push({
        issueKey: issue.key,
        summary: issueSummary(issue),
        reason: 'noStartAndEndDate',
      });
      continue;
    }

    if (!startDate && endDate) {
      missingDateIssues.push({
        issueKey: issue.key,
        summary: issueSummary(issue),
        reason: 'noStartDate',
      });
      continue;
    }

    const resolvedStart = startDate as Date;
    let resolvedEnd: Date;
    let isOpenEnded = false;

    if (!endDate) {
      resolvedEnd = now;
      isOpenEnded = true;
    } else {
      resolvedEnd = endDate;
    }

    const statusCategory = resolveStatusCategory(issue);
    const statusName = issue.fields.status?.name ?? '';

    const statusSections: BarStatusSection[] = [
      {
        statusName,
        category: statusCategory,
        startDate: resolvedStart,
        endDate: resolvedEnd,
      },
    ];

    const barColor = matchColorRule(issue, settings.colorRules ?? []);

    bars.push({
      issueKey: issue.key,
      issueId: issue.id,
      label: `${issue.key}: ${issueSummary(issue)}`,
      startDate: resolvedStart,
      endDate: resolvedEnd,
      isOpenEnded,
      statusSections,
      tooltipFields: buildTooltipFields(issue, settings.tooltipFieldIds),
      statusCategory,
      barColor,
    });
  }

  return { bars, missingDateIssues };
}
