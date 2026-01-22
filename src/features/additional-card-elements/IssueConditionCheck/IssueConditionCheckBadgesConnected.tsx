import React from 'react';
import { IssueConditionCheckBadges } from './IssueConditionCheckBadge';
import { useIssueConditionChecks } from './useIssueConditionChecks';

export interface IssueConditionCheckBadgesConnectedProps {
  issueKey: string;
}

/**
 * Connected component that fetches condition check results for an issue
 * and displays matching badges
 */
export const IssueConditionCheckBadgesConnected: React.FC<IssueConditionCheckBadgesConnectedProps> = ({
  issueKey,
}) => {
  const results = useIssueConditionChecks(issueKey);

  if (results.length === 0) {
    return null;
  }

  return <IssueConditionCheckBadges results={results} />;
};
