import { JiraIssueMapped } from 'src/shared/jira/types';
import { useJiraIssuesStore } from 'src/shared/jira/stores/jiraIssues/jiraIssues';
import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { Status, SubTasksProgress } from '../types';
import { useGetSettings } from './useGetSettings';

export const useGetSubtasksToCountProgress = (issueId: string) => {
  const { settings } = useGetSettings();
  const issue = useJiraIssuesStore(
    useShallow(state => {
      return state.issues.find(i => i.data.key === issueId);
    })
  );

  const subtasks = useJiraSubtasksStore(useShallow(state => state.data[issueId]));

  const linkedIssuesKeys =
    issue?.data.fields.issuelinks
      .map(link => {
        const linkedIssue = link.outwardIssue || link.inwardIssue;
        if (!linkedIssue) {
          return;
        }
        return linkedIssue.key;
      })
      .filter(v => v !== undefined) || [];
  const subtasksKeys = issue?.data.fields.subtasks.map(s => s.key) || [];

  if (!subtasks) {
    return [];
  }
  const issueType = issue?.data.issueType;

  switch (issueType) {
    case 'Epic': {
      const linkedIssues = settings.countEpicLinkedIssues
        ? subtasks.subtasks.filter(subtask => linkedIssuesKeys.includes(subtask.key))
        : [];
      const epicIssues = settings.countEpicIssues
        ? subtasks.subtasks.filter(subtask => !linkedIssuesKeys.includes(subtask.key))
        : [];

      return [...linkedIssues, ...epicIssues];
    }
    case 'Task': {
      const linkedIssues = settings.countIssuesLinkedIssues
        ? subtasks.subtasks.filter(subtask => linkedIssuesKeys.includes(subtask.key))
        : [];
      const issueSubtasks = settings.countIssuesSubtasks
        ? subtasks.subtasks.filter(subtask => subtasksKeys.includes(subtask.key))
        : [];

      return [...linkedIssues, ...issueSubtasks];
    }
    case 'Sub-task': {
      return settings.countSubtasksLinkedIssues
        ? subtasks.subtasks.filter(subtask => linkedIssuesKeys.includes(subtask.key))
        : [];
    }
    default:
      // logger.wwarn;
      return [];
  }
};

/**
 * Если задача - эпик, то в инфе о задаче есть прилинкованные задачи. Если в сабтасках есть задача эпика, но ее нет в прилинкованных - она задача эпика
 * Если задача - ишшуя, то в инфе о задаче есть и прилинкованные задачи и сабтаски, следует использовать эту инфу для определения типа связи
 * Если задача - сабтаска, то используем инфу о прилинкованных задачах
 * @returns
 */

const useCalcProgress = (
  subtasks: JiraIssueMapped[],
  externalLinks: JiraIssueMapped[]
): Record<string, SubTasksProgress> => {
  const { settings } = useGetSettings();
  const statusMapping = settings?.newStatusMapping || {};
  const groupingField = settings?.groupingField || 'project';
  const ignoredGroups = settings?.ignoredGroups || [];
  const { ignoredStatuses } = settings;
  const shouldUseCustomColorScheme = settings.useCustomColorScheme;

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

    if (ignoredStatuses.includes(issue.statusId)) {
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

export const useSubtasksProgress = (issueKey: string) => {
  const subtasks = useGetSubtasksToCountProgress(issueKey);
  const progress = useCalcProgress(subtasks, []);
  return progress;
};
