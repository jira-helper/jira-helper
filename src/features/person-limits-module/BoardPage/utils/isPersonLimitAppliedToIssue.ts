import type { PersonLimitStats } from '../models/types';

export const isPersonLimitAppliedToIssue = (
  stats: Pick<PersonLimitStats, 'persons' | 'columns' | 'swimlanes' | 'includedIssueTypes'>,
  assignee: string | null,
  columnId: string,
  swimlaneId?: string | null,
  issueType?: string | null
): boolean => {
  const isAssigneeMatch = stats.persons.some(
    person => person.name === assignee || (person.displayName != null && person.displayName === assignee)
  );
  if (!isAssigneeMatch) return false;

  const isColumnMatch = stats.columns.length === 0 || stats.columns.some(column => column.id === columnId);
  if (!isColumnMatch) return false;

  const isSwimlaneMatch =
    stats.swimlanes.length === 0 || (swimlaneId != null && stats.swimlanes.some(sw => sw.id === swimlaneId));
  if (!isSwimlaneMatch) return false;

  const isTypeMatch =
    !stats.includedIssueTypes ||
    stats.includedIssueTypes.length === 0 ||
    (issueType != null && stats.includedIssueTypes.includes(issueType));

  return isTypeMatch;
};
