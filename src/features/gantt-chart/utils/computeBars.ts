import { mapStatusCategoryColorToProgressStatus } from 'src/features/sub-tasks-progress/colorSchemas';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import type { ExternalIssueMapped, JiraField } from 'src/infrastructure/jira/types';
import { extractTokensFromRawValue, getFieldValueForJql } from 'src/infrastructure/jira/fields/getFieldValueForJql';
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
import { computeStatusSections } from './computeStatusSections';

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

/**
 * When the user restricts which issue link types/directions to follow
 * (`settings.issueLinkTypesToInclude`), check that this issue's link to the
 * root matches one of the allowed selections. Empty filter ⇒ allow all.
 *
 * Direction follows the same convention as
 * `useSubtasksProgress.getLinkedIssuesKeysWithChosenLinks`: a selection of
 * `inward`/`outward` matches a link whose corresponding `inwardIssue`/
 * `outwardIssue` field points to the root, with matching `link.type.id`.
 */
function matchesLinkTypeFilter(issue: GanttIssueInput, rootIssueKey: string, settings: GanttScopeSettings): boolean {
  const allowed = settings.issueLinkTypesToInclude;
  if (!allowed || allowed.length === 0) return true;
  const links = issue.fields.issuelinks;
  if (!links?.length) return false;
  for (const link of links) {
    const linkTypeId = link.type?.id;
    if (!linkTypeId) continue;
    for (const sel of allowed) {
      if (sel.id !== linkTypeId) continue;
      if (sel.direction === 'inward' && link.inwardIssue?.key === rootIssueKey) return true;
      if (sel.direction === 'outward' && link.outwardIssue?.key === rootIssueKey) return true;
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

function resolveSingleMappingDate(mapping: DateMapping, issue: GanttIssueInput): Date | null {
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

/** Iterates `mappings` in priority order and returns the first mapping that resolves to a valid Date. */
function resolveMappingDate(mappings: DateMapping[] | undefined, issue: GanttIssueInput): Date | null {
  if (!mappings || mappings.length === 0) return null;
  for (const m of mappings) {
    const d = resolveSingleMappingDate(m, issue);
    if (d) return d;
  }
  return null;
}

/**
 * Field-mode value match: prefer schema-aware tokens via {@link getFieldValueForJql} (handles
 * `customfield_NNNNN` of type `array<option>` etc. correctly), and fall back to raw direct tokens
 * when the metadata is unavailable. The fallback preserves pre-`fields`-prop behaviour for tests
 * and bootstrap.
 */
function fieldValueMatchesExpected(
  issue: GanttIssueInput,
  fieldId: string,
  expected: string,
  fields: ReadonlyArray<JiraField>
): boolean {
  if (fields.length > 0) {
    const tokens = getFieldValueForJql(issue, fields)(fieldId);
    if (tokens.length > 0) return tokens.includes(expected);
  }
  return extractTokensFromRawValue(issue.fields[fieldId]).includes(expected);
}

function matchesSingleFilter(
  issue: GanttIssueInput,
  filter: ExclusionFilter,
  fields: ReadonlyArray<JiraField>
): boolean {
  if (filter.mode === 'jql') {
    if (!filter.jql || filter.jql.trim() === '') return false;
    try {
      const matcher = parseJql(filter.jql);
      return matcher(getFieldValueForJql(issue, fields));
    } catch {
      return false;
    }
  }
  if (filter.mode !== 'field') return false;
  const { fieldId } = filter;
  const expected = filter.value;
  if (!fieldId || expected === undefined) return false;
  return fieldValueMatchesExpected(issue, fieldId, expected, fields);
}

function isExcludedByFilters(
  issue: GanttIssueInput,
  settings: GanttScopeSettings,
  fields: ReadonlyArray<JiraField>
): boolean {
  const filters = settings.exclusionFilters;
  if (!filters || filters.length === 0) return false;
  return filters.some(f => matchesSingleFilter(issue, f, fields));
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
 *
 * `fields` is the Jira field metadata used by the JQL parser to resolve display names
 * (e.g. JQL `Platform = Backend` → `customfield_178101 = Backend`). Pass an empty array to
 * keep the legacy raw-tokens behaviour (the function still works for `customfield_X` lookups by id).
 */
export function matchColorRule(
  issue: GanttIssueInput,
  rules: ColorRule[],
  fields: ReadonlyArray<JiraField> = []
): string | undefined {
  for (const rule of rules) {
    if (rule.selector.mode === 'jql') {
      if (!rule.selector.jql || rule.selector.jql.trim() === '') continue;
      try {
        const matcher = parseJql(rule.selector.jql);
        if (matcher(getFieldValueForJql(issue, fields))) return rule.color;
      } catch {
        continue;
      }
      continue;
    }
    if (rule.selector.mode !== 'field') continue;
    const { fieldId } = rule.selector;
    const expected = rule.selector.value;
    if (!fieldId || expected === undefined) continue;
    if (fieldValueMatchesExpected(issue, fieldId, expected, fields)) {
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
 * @param fields Jira field metadata (id / name / clauseNames / schema). Optional — when provided,
 *   JQL color rules and exclusion filters can refer to fields by display name and the `option`/`array<option>`
 *   schemas (e.g. multi-select custom fields like Platform) match correctly.
 */
export function computeBars(
  subtasks: GanttIssueInput[],
  settings: GanttScopeSettings,
  now: Date = new Date(),
  rootIssueKey?: string,
  fields: ReadonlyArray<JiraField> = []
): ComputeBarsResult {
  const bars: GanttBar[] = [];
  const missingDateIssues: MissingDateIssue[] = [];

  const categoryByStatusName = new Map<string, BarStatusCategory>();
  for (const issue of subtasks) {
    const name = issue.fields.status?.name;
    if (!name || categoryByStatusName.has(name)) continue;
    categoryByStatusName.set(name, resolveStatusCategory(issue));
  }

  for (const issue of subtasks) {
    if (rootIssueKey) {
      const relation = classifyRelation(issue, rootIssueKey);
      if (relation === 'subtask' && !settings.includeSubtasks) continue;
      if (relation === 'epicChild' && !settings.includeEpicChildren) continue;
      if (relation === 'issueLink') {
        if (!settings.includeIssueLinks) continue;
        if (!matchesLinkTypeFilter(issue, rootIssueKey, settings)) continue;
      }
    }

    if (isExcludedByFilters(issue, settings, fields)) {
      missingDateIssues.push({
        issueKey: issue.key,
        summary: issueSummary(issue),
        reason: 'excluded',
      });
      continue;
    }

    const startDate = resolveMappingDate(settings.startMappings, issue);
    const endDate = resolveMappingDate(settings.endMappings, issue);

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

    const transitions = parseChangelog(issue.changelog);
    const statusSections: BarStatusSection[] =
      transitions.length > 0
        ? computeStatusSections(transitions, resolvedStart, resolvedEnd, categoryByStatusName)
        : [
            {
              statusName,
              category: statusCategory,
              startDate: resolvedStart,
              endDate: resolvedEnd,
            },
          ];

    const barColor = matchColorRule(issue, settings.colorRules ?? [], fields);

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
