import type { PersonLimitStats } from '../models/types';

/**
 * Checks if a limit applies to a given issue.
 *
 * The limit applies when ALL conditions are met:
 * 1. Assignee matches any person in the persons array (by name, or legacy displayName)
 * 2. Issue is in one of the specified columns (or all columns if empty)
 * 3. Issue is in one of the specified swimlanes (or all swimlanes if empty)
 * 4. Issue type matches one of the included types (or all types if empty/undefined)
 */
export const isPersonLimitAppliedToIssue = (
  stats: Pick<PersonLimitStats, 'persons' | 'columns' | 'swimlanes' | 'includedIssueTypes'>,
  assignee: string | null,
  columnId: string,
  swimlaneId?: string | null,
  issueType?: string | null
): boolean => {
  // 1. Check assignee match against any person in array
  const isAssigneeMatch = stats.persons.some(
    person => person.name === assignee || (person.displayName != null && person.displayName === assignee)
  );
  if (!isAssigneeMatch) return false;

  // 2. Check column match (empty array = all columns)
  const isColumnMatch = stats.columns.length === 0 || stats.columns.some(column => column.id === columnId);
  if (!isColumnMatch) return false;

  // 3. Check swimlane match (empty array = all swimlanes)
  const isSwimlaneMatch =
    stats.swimlanes.length === 0 ||
    (swimlaneId != null && stats.swimlanes.some(sw => sw.id === swimlaneId));
  if (!isSwimlaneMatch) return false;

  // 4. Check issue type match (undefined/empty = all types)
  const isTypeMatch =
    !stats.includedIssueTypes ||
    stats.includedIssueTypes.length === 0 ||
    (issueType != null && stats.includedIssueTypes.includes(issueType));

  return isTypeMatch;
};