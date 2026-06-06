import type { GanttScopeSettings, GanttSettingsStorage, ScopeKey } from '../types';

/**
 * Build serialized storage key for a Gantt settings scope.
 *
 * @example buildScopeKey('PROJECT-A', 'Story') → 'PROJECT-A:Story'
 * @example buildScopeKey('PROJECT-A') → 'PROJECT-A'
 * @example buildScopeKey() → '_global'
 */
export function buildScopeKey(projectKey?: string, issueType?: string): ScopeKey {
  const pk = projectKey?.trim() ?? '';
  if (!pk) {
    return '_global';
  }
  const it = issueType?.trim() ?? '';
  if (it) {
    return `${pk}:${it}`;
  }
  return pk;
}

/**
 * Resolve cascading settings for a project (and optional issue type).
 * Priority: `PROJECT:IssueType` > `PROJECT` > `_global`.
 *
 * @returns The most specific settings found in storage, or `null` if none exist.
 */
export function resolveSettings(
  storage: GanttSettingsStorage,
  projectKey: string,
  issueType?: string
): GanttScopeSettings | null {
  const pk = projectKey.trim();
  const it = issueType?.trim();

  const keys: string[] = [];
  if (pk && it) {
    keys.push(`${pk}:${it}`);
  }
  if (pk) {
    keys.push(pk);
  }
  keys.push('_global');

  for (const key of keys) {
    const settings = storage[key];
    if (settings !== undefined && settings !== null) {
      return settings;
    }
  }

  return null;
}
