import type {
  PersonLimit,
  PersonLimit_2_29,
  PersonLimit_2_30,
  PersonLimit_2_31,
  PersonLimit_2_32,
  PersonWipLimitsProperty,
  PersonWipLimitsProperty_2_29,
  PersonWipLimitsProperty_2_30,
} from './types';

/**
 * Migrates a single limit from v2.29/v2.30/v2.31 to the latest v2.32 format.
 * Conversions:
 * - single `person` object → `persons: [person]`
 * - missing `showAllPersonIssues` → `true`
 * - missing `sharedLimit` → `false`
 *
 * Idempotent — does not overwrite existing values.
 */
export function migratePersonLimitToLatest(
  limit: PersonLimit_2_29 | PersonLimit_2_30 | PersonLimit_2_31 | PersonLimit_2_32
): PersonLimit_2_32 {
  if ('persons' in limit) {
    const v2_31 = limit as PersonLimit_2_31;
    if ('sharedLimit' in v2_31) {
      return v2_31 as PersonLimit_2_32;
    }
    return { ...v2_31, sharedLimit: false };
  }

  if ('person' in limit) {
    const { person } = limit;
    const result: PersonLimit_2_32 = {
      id: limit.id,
      limit: limit.limit,
      columns: limit.columns,
      swimlanes: limit.swimlanes,
      persons: [person],
      showAllPersonIssues: 'showAllPersonIssues' in limit ? limit.showAllPersonIssues : true,
      sharedLimit: false,
    };
    if ('includedIssueTypes' in limit) {
      (result as PersonLimit_2_32 & { includedIssueTypes: typeof limit.includedIssueTypes }).includedIssueTypes =
        limit.includedIssueTypes;
    }
    return result;
  }

  return limit as PersonLimit_2_32;
}

/**
 * Migrates PersonWipLimitsProperty to latest format (v2.32).
 */
export function migratePropertyToLatest(
  data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty_2_30 | PersonWipLimitsProperty
): PersonWipLimitsProperty {
  return {
    limits: data.limits.map(migratePersonLimitToLatest),
  };
}

/**
 * Migrates a single limit to the latest format. Wrapper kept for backward compat.
 */
export function migratePersonLimit(limit: PersonLimit_2_29 | PersonLimit): PersonLimit {
  return migratePersonLimitToLatest(limit);
}

/**
 * Migrates PersonWipLimitsProperty to the latest format. Wrapper kept for backward compat.
 */
export function migrateProperty(data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty): PersonWipLimitsProperty {
  return migratePropertyToLatest(data);
}
