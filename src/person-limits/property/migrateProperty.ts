import type { PersonLimit, PersonLimit_2_29, PersonWipLimitsProperty, PersonWipLimitsProperty_2_29 } from './types';

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
  return {
    limits: data.limits.map(migratePersonLimit),
  };
}
