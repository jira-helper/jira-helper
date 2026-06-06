import type { PersonLimitStats } from '../models/types';

/**
 * Checks if an issue belongs to any of the persons by assignee match.
 * Used when showAllPersonIssues is true — ignores column/swimlane/type filters.
 *
 * Matches by name or legacy displayName against any person in the array.
 */
export const isPersonsIssue = (stats: Pick<PersonLimitStats, 'persons'>, assignee: string | null): boolean => {
  return stats.persons.some(
    person => person.name === assignee || (person.displayName != null && person.displayName === assignee)
  );
};
