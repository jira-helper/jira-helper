import type { PersonLimitStats } from '../models/types';

/**
 * Checks if an issue belongs to a person by assignee match only.
 * Used when showAllPersonIssues is true — ignores column/swimlane/type filters.
 *
 * Matches by name or legacy displayName.
 */
export const isPersonsIssue = (person: Pick<PersonLimitStats, 'person'>, assignee: string | null): boolean => {
  return (
    person.person.name === assignee || (person.person.displayName != null && person.person.displayName === assignee)
  );
};
