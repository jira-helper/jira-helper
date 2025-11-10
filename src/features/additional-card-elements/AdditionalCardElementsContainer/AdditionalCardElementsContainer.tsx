import React, { useEffect } from 'react';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { globalContainer } from 'dioma';
import { loadSubtasksForIssue } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/actions/loadSubtasksForIssue';
import { useGetSettings } from '../hooks/useGetSettings';
import { IssueLinkBadges } from '../IssueLinkBadges/IssueLinkBadges';

const AdditionalCardElements = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  const container = useDi();
  const boardPage = container.inject(boardPagePageObjectToken);
  const issueColumn = boardPage.getColumnOfIssue(issueId);

  // Check if feature is enabled and card is in tracked column
  const shouldDisplay = settings?.enabled && settings?.columnsToTrack?.includes(issueColumn);

  useEffect(() => {
    if (!shouldDisplay) {
      return;
    }

    const abortController = new AbortController();
    loadSubtasksForIssue(issueId, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [shouldDisplay, issueId]);

  if (!shouldDisplay) {
    return null;
  }

  return <IssueLinkBadges issueKey={issueId} />;
};

export const AdditionalCardElementsContainer = (props: { issueId: string }) => {
  const container = globalContainer;
  return (
    <WithDi container={container}>
      <AdditionalCardElements {...props} />
    </WithDi>
  );
};
