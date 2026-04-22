import { JiraField } from '../types';

/**
 * Minimal issue shape required by the JQL field-value resolver.
 * Any object with a `fields` bag is acceptable — `JiraIssueMapped`, raw `GanttIssueInput`, etc.
 */
export type IssueLikeForJql = { fields: Record<string, unknown> };

/**
 * Schema-aware extraction of a single Jira field's value to one or more comparable string tokens.
 *
 * Mirrors how Jira itself compares values in JQL clauses:
 * - `project` → `[key]`
 * - `priority` / `status` / `issuetype` → `[name]`
 * - `user` → `[displayName, emailAddress, name]` (any of them satisfies `=`)
 * - `option` / `string` → `[value]`
 * - `array` of `option` / `string` → `[value, ...]`
 * - `array` of `component` → `[name, ...]`
 *
 * For unknown / missing schemas returns an empty array (no fallback here — the caller
 * decides whether to fall back to a raw direct lookup).
 */
export function extractFieldValueBySchema(issue: IssueLikeForJql, field: JiraField): string[] {
  const val = issue.fields[field.id];
  if (val === undefined || val === null) return [];

  switch (field.schema?.type) {
    case 'string':
    case 'option':
      return val && typeof val === 'object' && (val as { value?: unknown }).value !== undefined
        ? [String((val as { value: unknown }).value)]
        : [];
    case 'project':
      return val && typeof val === 'object' && (val as { key?: unknown }).key !== undefined
        ? [String((val as { key: unknown }).key)]
        : [];
    case 'priority':
    case 'status':
    case 'issuetype':
      return val && typeof val === 'object' && (val as { name?: unknown }).name !== undefined
        ? [String((val as { name: unknown }).name)]
        : [];
    case 'user': {
      const u = val as { displayName?: unknown; emailAddress?: unknown; name?: unknown };
      const arr: string[] = [];
      if (typeof u.displayName === 'string') arr.push(u.displayName);
      if (typeof u.emailAddress === 'string') arr.push(u.emailAddress);
      if (typeof u.name === 'string') arr.push(u.name);
      return arr;
    }
    case 'array': {
      if (!Array.isArray(val)) return [];
      switch (field.schema.items) {
        case 'component':
          return (val as Array<{ name?: unknown }>).map(v => String(v?.name ?? '')).filter(Boolean);
        case 'string':
        case 'option':
          return (val as Array<{ value?: unknown }>).map(v => String(v?.value ?? '')).filter(Boolean);
        default:
          return [];
      }
    }
    default:
      return [];
  }
}

/**
 * Extract every string token a raw value can be compared against in JQL.
 * Used as the fallback when a field is not described in the JiraField metadata
 * (so we can still match on direct shapes like `{ key, name, value, displayName, emailAddress }`).
 */
export function extractTokensFromRawValue(raw: unknown): string[] {
  if (raw === null || raw === undefined) return [];
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return [String(raw)];
  }
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      for (const t of extractTokensFromRawValue(item)) {
        if (t !== '' && !out.includes(t)) out.push(t);
      }
    }
    return out;
  }
  if (typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const out: string[] = [];
    const push = (v: unknown) => {
      if (typeof v === 'string' && v !== '' && !out.includes(v)) out.push(v);
      else if (typeof v === 'number' && !out.includes(String(v))) out.push(String(v));
    };
    push(r.key);
    push(r.name);
    push(r.id);
    push(r.value);
    push(r.displayName);
    push(r.emailAddress);
    return out;
  }
  return [];
}

/**
 * Returns a `(fieldName) => string[]` resolver for use with {@link parseJql}.
 *
 * Lookup strategy (case-insensitive throughout):
 * 1. Find every {@link JiraField} matching `fieldName` by `id`, `name`, or any `clauseNames` entry —
 *    multiple matches are supported (Jira allows several fields to share a display name; the resolver
 *    flattens tokens from all of them so JQL like `Project = TEST` keeps working).
 * 2. Extract values via {@link extractFieldValueBySchema}.
 * 3. If no field metadata matches, fall back to a direct `issue.fields[name]` lookup (lowercase + exact)
 *    and tokenize via {@link extractTokensFromRawValue}. This keeps queries by raw `customfield_NNNNN`
 *    or by well-known system field id (`project`, `priority`, …) working when `fields` is empty
 *    (e.g. metadata still loading).
 *
 * Returning an empty array means "field exists but has no comparable value" — JQL `=` will not match,
 * which is the correct semantics for empty/null fields.
 */
export function getFieldValueForJql<T extends IssueLikeForJql>(
  issue: T,
  fields: ReadonlyArray<JiraField>
): (fieldName: string) => string[] {
  return (fieldName: string) => {
    const lower = fieldName.toLowerCase();

    if (fields.length > 0) {
      const matched = fields.filter(
        f =>
          f.id.toLowerCase() === lower ||
          f.name.toLowerCase() === lower ||
          (f.clauseNames && f.clauseNames.some(cn => cn.toLowerCase() === lower))
      );
      if (matched.length > 0) {
        const out: string[] = [];
        for (const f of matched) {
          for (const t of extractFieldValueBySchema(issue, f)) {
            if (!out.includes(t)) out.push(t);
          }
        }
        return out;
      }
    }

    if (Object.prototype.hasOwnProperty.call(issue.fields, fieldName)) {
      return extractTokensFromRawValue(issue.fields[fieldName]);
    }
    if (Object.prototype.hasOwnProperty.call(issue.fields, lower)) {
      return extractTokensFromRawValue(issue.fields[lower]);
    }
    for (const [key, val] of Object.entries(issue.fields)) {
      if (key.toLowerCase() === lower) return extractTokensFromRawValue(val);
    }
    return [];
  };
}
