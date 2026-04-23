import type { PersonLimit, PersonLimit_2_29, PersonLimit_2_30, PersonLimit_2_31, PersonWipLimitsProperty, PersonWipLimitsProperty_2_29, PersonWipLimitsProperty_2_30 } from './types';

/**
 * Migrates a single limit from v2.29/v2.30 to v2.31 format.
 * Converts single `person` object to `persons` array.
 * Idempotent — does not overwrite existing values.
 */
export function migratePersonLimitToLatest(
  limit: PersonLimit_2_29 | PersonLimit_2_30 | PersonLimit_2_31
): PersonLimit_2_31 {
  if ('persons' in limit) {
    return limit as PersonLimit_2_31;
  }

  if ('person' in limit) {
    const { person } = limit;
    const result: PersonLimit_2_31 = {
      id: limit.id,
      limit: limit.limit,
      columns: limit.columns,
      swimlanes: limit.swimlanes,
      persons: [person],
      showAllPersonIssues: 'showAllPersonIssues' in limit ? limit.showAllPersonIssues : true,
    };
    if ('includedIssueTypes' in limit) {
      (result as PersonLimit_2_31 & { includedIssueTypes: typeof limit.includedIssueTypes }).includedIssueTypes = limit.includedIssueTypes;
    }
    return result;
  }

  return limit as PersonLimit_2_31;
}

/**
 * Migrates PersonWipLimitsProperty to latest format (v2.31).
 */
export function migratePropertyToLatest(
  data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty_2_30 | PersonWipLimitsProperty
): PersonWipLimitsProperty {
  return {
    limits: data.limits.map(migratePersonLimitToLatest),
  };
}

/**
 * Migrates a single limit from v2.29 to v2.30 format.
 * Adds showAllPersonIssues: true if the field is missing.
 * Idempotent — does not overwrite existing values.
 */
export function migratePersonLimit(limit: PersonLimit_2_29 | PersonLimit): PersonLimit {
  return {
    ...limit,
    showAllPersonIssues: 'showAllPersonIssues' in limit ? limit.showAllPersonIssues : true,
  };
}

/**
 * Migrates PersonWipLimitsProperty from v2.29 to v2.30 format.
 * Applies migratePersonLimit to each limit in the array.
 */
export function migrateProperty(data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty): PersonWipLimitsProperty {
  return migratePropertyToLatest(data);
}