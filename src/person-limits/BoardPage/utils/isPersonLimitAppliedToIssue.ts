import type { PersonLimitStats } from '../stores';

/**
 * Checks if a person's WIP limit applies to a given issue.
 *
 * The limit applies when ALL conditions are met:
 * 1. Assignee matches the person (by name, or legacy displayName)
 * 2. Issue is in one of the specified columns (or all columns if empty)
 * 3. Issue is in one of the specified swimlanes (or all swimlanes if empty)
 * 4. Issue type matches one of the included types (or all types if empty/undefined)
 *
 * @param personLimit - The person's limit configuration
 * @param assignee - The issue's assignee name (null if unassigned)
 * @param columnId - The column ID where the issue is located
 * @param swimlaneId - The swimlane ID (null if no custom swimlanes)
 * @param issueType - The issue type (null if unknown)
 * @returns true if the limit applies to this issue
 *
 * @example
 * ```ts
 * const applies = isPersonLimitAppliedToIssue(
 *   personLimit,
 *   'John Doe',
 *   'col-123',
 *   'swim-456',
 *   'Task'
 * );
 * ```
 */
export const isPersonLimitAppliedToIssue = (
  personLimit: Pick<PersonLimitStats, 'person' | 'columns' | 'swimlanes' | 'includedIssueTypes'>,
  assignee: string | null,
  columnId: string,
  swimlaneId?: string | null,
  issueType?: string | null
): boolean => {
  // 1. Check assignee match
  const isAssigneeMatch =
    personLimit.person.name === assignee || (personLimit.person.displayName != null && personLimit.person.displayName === assignee);
  if (!isAssigneeMatch) return false;

  // 2. Check column match (empty array = all columns)
  const isColumnMatch = personLimit.columns.length === 0 || personLimit.columns.some(column => column.id === columnId);
  if (!isColumnMatch) return false;

  // 3. Check swimlane match (empty array = all swimlanes)
  const isSwimlaneMatch =
    personLimit.swimlanes.length === 0 ||
    (swimlaneId != null && personLimit.swimlanes.some(sw => sw.id === swimlaneId));
  if (!isSwimlaneMatch) return false;

  // 4. Check issue type match (undefined/empty = all types)
  const isTypeMatch =
    !personLimit.includedIssueTypes ||
    personLimit.includedIssueTypes.length === 0 ||
    (issueType != null && personLimit.includedIssueTypes.includes(issueType));

  return isTypeMatch;
};
