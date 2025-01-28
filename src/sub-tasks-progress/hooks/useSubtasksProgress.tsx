import { JiraIssueMapped } from 'src/shared/jira/types';
import { Status, SubTasksProgress } from '../types';
import { useGetSettings } from './useGetSettings';

export const useSubtasksProgress = (
  subtasks: JiraIssueMapped[],
  externalLinks: JiraIssueMapped[],
  shouldUseCustomColorScheme: boolean
): Record<string, SubTasksProgress> => {
  const { settings } = useGetSettings();
  const statusMapping = settings?.newStatusMapping || {};
  const groupingField = settings?.groupingField || 'project';
  const ignoredGroups = settings?.ignoredGroups || [];

  const progress: Record<string, SubTasksProgress> = {};
  const set = new Set<string>();

  const mapStatusCategeoryToProgressStatus = (statusCategory: JiraIssueMapped['statusCategory']) => {
    if (statusCategory === 'new') {
      return 'todo';
    }
    if (statusCategory === 'indeterminate') {
      return 'inProgress';
    }
    return 'done';
  };
  const mapIssue = (issue: JiraIssueMapped) => {
    set.add(issue.statusCategory);
    const status: { name: string; progressStatus: Status } = shouldUseCustomColorScheme
      ? statusMapping[issue.statusId] || { name: issue.status, progressStatus: 'unmapped' }
      : { name: issue.status, progressStatus: mapStatusCategeoryToProgressStatus(issue.statusCategory) };

    if (status.progressStatus === 'ignored') {
      return;
    }
    const group = issue[groupingField];
    if (ignoredGroups.includes(group)) {
      return;
    }

    if (!progress[group]) {
      progress[group] = {
        todo: 0,
        inProgress: 0,
        almostDone: 0,
        done: 0,
        blocked: 0,
        unmapped: 0,
      };
    }

    progress[group][status.progressStatus] += 1;
  };
  subtasks.forEach(mapIssue);
  externalLinks.forEach(mapIssue);

  return progress;
};
