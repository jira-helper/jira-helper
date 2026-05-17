import React, { useMemo } from 'react';
import { useDi } from 'src/infrastructure/di/diContext';
import { ganttSettingsModelToken } from '../../tokens';
import { CollapsibleGanttSection } from './CollapsibleGanttSection';

export type GanttIssueChartRuntimeContainerProps = {
  issueKey: string;
};

/**
 * Issue-view runtime gate: mounts the collapsible Gantt section only when the local feature toggle is on.
 * The DOM host for this tree is owned by {@link GanttChartIssuePage} (stable section wrapper).
 */
export const GanttIssueChartRuntimeContainer: React.FC<GanttIssueChartRuntimeContainerProps> = ({ issueKey }) => {
  const container = useDi();
  const settingsEntry = useMemo(() => container.inject(ganttSettingsModelToken), [container]);
  const settingsSnapshot = settingsEntry.useModel();

  if (!settingsSnapshot.featureEnabled) {
    return null;
  }

  return <CollapsibleGanttSection issueKey={issueKey} container={container} />;
};
