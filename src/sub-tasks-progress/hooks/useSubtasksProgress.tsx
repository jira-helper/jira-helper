import { JiraIssueMapped } from 'src/shared/jira/types';
import { SubTasksProgress } from '../types';
import { useGetSettings } from './useGetSettings';

export const useSubtasksProgress = (
  subtasks: JiraIssueMapped[],
  externalLinks: JiraIssueMapped[]
): Record<string, SubTasksProgress> => {
  const { settings } = useGetSettings();
  const statusMapping = settings?.statusMapping || {};
  const groupingField = settings?.groupingField || 'project';

  const progress: Record<string, SubTasksProgress> = {};

  const mapIssue = (issue: JiraIssueMapped) => {
    const group = issue[groupingField];
    if (!progress[group]) {
      progress[group] = {
        backlog: 0,
        todo: 0,
        inProgress: 0,
        almostDone: 0,
        done: 0,
        blocked: 0,
        unmapped: 0,
      };
    }
    const status = statusMapping[issue.status] || 'unmapped';
    progress[group][status] += 1;
    return progress;
  };
  subtasks.forEach(mapIssue);
  externalLinks.forEach(mapIssue);
  return progress;
};
