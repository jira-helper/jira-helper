import React, { useEffect } from 'react';
import { useDi, WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { loadSubtasksForIssue } from 'src/shared/jira/stores/jiraSubtasks.actions';
import { useGetSettings } from '../hooks/useGetSettings';
import { IssueLinkBadges } from '../IssueLinkBadges/IssueLinkBadges';

const AdditionalCardElementsBacklog = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;

  // Check if feature is enabled and showInBacklog is enabled
  // In backlog, we don't check columns (there are no columns in backlog)
  const shouldDisplay = settings?.enabled && settings?.showInBacklog;

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

  return <IssueLinkBadges issueKey={issueId} horizontal />;
};

export const AdditionalCardElementsBacklogContainer = (props: { issueId: string }) => {
  const container = globalContainer;
  return (
    <WithDi container={container}>
      <AdditionalCardElementsBacklog {...props} />
    </WithDi>
  );
};
