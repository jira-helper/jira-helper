import { parseJql } from 'src/shared/jql/simpleJqlParser';
import type { JiraField } from 'src/infrastructure/jira/types';
import { extractTokensFromRawValue, getFieldValueForJql } from 'src/infrastructure/jira/fields/getFieldValueForJql';
import type { QuickFilter } from '../types';
import type { GanttIssueInput } from '../utils/computeBars';
import { BUILT_IN_QUICK_FILTER_IDS, isBuiltInQuickFilterId } from './builtIns';

function matchBuiltIn(filter: QuickFilter, issue: GanttIssueInput): boolean {
  if (filter.id === BUILT_IN_QUICK_FILTER_IDS.unresolved) {
    // `resolution` is `null` for unresolved issues; `{ name: 'Done' }` otherwise.
    const r = issue.fields.resolution as unknown;
    if (r === null || r === undefined) return true;
    if (typeof r === 'object') {
      return extractTokensFromRawValue(r).length === 0;
    }
    return r === '';
  }
  if (filter.id === BUILT_IN_QUICK_FILTER_IDS.hideCompleted) {
    const cat = issue.fields.status?.statusCategory?.key;
    return cat !== 'done';
  }
  return false;
}

/**
 * Returns true when the issue passes the quick filter (i.e. would be SHOWN on the chart).
 * Multiple active quick filters combine via AND in the caller — see {@link applyQuickFiltersToBars}.
 *
 * Behaviour:
 * - Built-in filter ids (e.g. `builtin:unresolved`) are dispatched to dedicated matchers.
 * - JQL filters use {@link parseJql} with {@link getFieldValueForJql} so display names like
 *   `Platform = Backend` are resolved to `customfield_178101` and matched against schema-aware
 *   tokens (e.g. `array<option>` returns `[value, ...]`). An invalid JQL passes everything
 *   (graceful fallback so the chart does not silently empty when the user mistypes a query).
 * - Field filters compare the configured `value` against the resolved tokens for the configured
 *   `fieldId` — schema-aware when metadata is available, else a raw direct lookup.
 *
 * `fields` is the Jira field metadata. Pass an empty array to keep the legacy raw-tokens behaviour
 * (matching by `customfield_NNNNN` id still works in that mode).
 */
export function matchQuickFilter(
  issue: GanttIssueInput,
  filter: QuickFilter,
  fields: ReadonlyArray<JiraField> = []
): boolean {
  if (isBuiltInQuickFilterId(filter.id)) {
    return matchBuiltIn(filter, issue);
  }
  const sel = filter.selector;
  if (sel.mode === 'jql') {
    if (!sel.jql || sel.jql.trim() === '') return true;
    try {
      const matcher = parseJql(sel.jql);
      return matcher(getFieldValueForJql(issue, fields));
    } catch {
      return true;
    }
  }
  if (sel.mode === 'field') {
    if (!sel.fieldId || sel.value === undefined) return true;
    if (fields.length > 0) {
      const tokens = getFieldValueForJql(issue, fields)(sel.fieldId);
      if (tokens.length > 0) return tokens.includes(sel.value);
    }
    return extractTokensFromRawValue(issue.fields[sel.fieldId]).includes(sel.value);
  }
  return true;
}
