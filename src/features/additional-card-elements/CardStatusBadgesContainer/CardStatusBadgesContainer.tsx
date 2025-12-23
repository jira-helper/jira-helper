import React from 'react';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { globalContainer } from 'dioma';
import { useGetSettings } from '../hooks/useGetSettings';
import { DaysInColumnBadge } from '../DaysInColumn/DaysInColumnBadge';
import { DaysToDeadlineBadge } from '../DaysToDeadline/DaysToDeadlineBadge';
import styles from './CardStatusBadgesContainer.module.css';

const CardStatusBadgesContainerInner = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  const container = useDi();
  const boardPage = container.inject(boardPagePageObjectToken);
  const issueColumn = boardPage.getColumnOfIssue(issueId);

  // Check if feature is enabled and card is in tracked column
  const isEnabled = settings?.enabled && settings?.columnsToTrack?.includes(issueColumn);

  if (!isEnabled) {
    return null;
  }

  const showDaysInColumn = settings?.daysInColumn?.enabled;
  const showDaysToDeadline = settings?.daysToDeadline?.enabled && settings?.daysToDeadline?.fieldId;

  if (!showDaysInColumn && !showDaysToDeadline) {
    return null;
  }

  return (
    <div className={styles.container}>
      {showDaysInColumn && <DaysInColumnBadge issueKey={issueId} />}
      {showDaysToDeadline && <DaysToDeadlineBadge issueKey={issueId} />}
    </div>
  );
};

export const CardStatusBadgesContainer = (props: { issueId: string }) => {
  const container = globalContainer;
  return (
    <WithDi container={container}>
      <CardStatusBadgesContainerInner {...props} />
    </WithDi>
  );
};
