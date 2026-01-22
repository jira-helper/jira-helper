import React from 'react';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { IssueConditionCheckBadgesConnected } from './IssueConditionCheckBadgesConnected';
import { useGetSettings } from '../hooks/useGetSettings';

export interface IssueConditionCheckContainerProps {
  issueId: string;
}

const IssueConditionCheckContainerInner: React.FC<IssueConditionCheckContainerProps> = ({ issueId }) => {
  const { settings } = useGetSettings();

  // Check if feature is enabled and has any condition checks
  const isEnabled = settings?.enabled;
  const hasConditionChecks = (settings?.issueConditionChecks || []).some(check => check.enabled);

  if (!isEnabled || !hasConditionChecks) {
    return null;
  }

  return <IssueConditionCheckBadgesConnected issueKey={issueId} />;
};

export const IssueConditionCheckContainer: React.FC<IssueConditionCheckContainerProps> = props => {
  return (
    <WithDi container={globalContainer}>
      <IssueConditionCheckContainerInner {...props} />
    </WithDi>
  );
};
