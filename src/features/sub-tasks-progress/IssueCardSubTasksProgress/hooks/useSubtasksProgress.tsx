import { JiraIssueMapped } from 'src/shared/jira/types';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues';
import { useGetTextsByLocale } from 'src/shared/texts';
import { Status, SubTasksProgress } from '../../types';
import { useGetSettings } from '../../SubTaskProgressSettings/hooks/useGetSettings';
import { mapStatusCategoryColorToProgressStatus } from '../../colorSchemas';

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

const createEmptyGroup = () => ({
  progress: {
    todo: 0,
    inProgress: 0,
    almostDone: 0,
    done: 0,
    blocked: 0,
    unmapped: 0,
  },
  comments: [],
});

/**
 * Если задача - эпик, то в инфе о задаче есть прилинкованные задачи. Если в сабтасках есть задача эпика, но ее нет в прилинкованных - она задача эпика
 * Если задача - ишшуя, то в инфе о задаче есть и прилинкованные задачи и сабтаски, следует использовать эту инфу для определения типа связи
 * Если задача - сабтаска, то используем инфу о прилинкованных задачах
 * @returns
 */

const TEXTS = {
  unmappedIssue: {
    en: 'Unmapped issue',
    ru: 'Неизвестный статус',
  },
  blockedByLinks: {
    en: 'Blocked by links',
    ru: 'Заблокировано ссылкой blocked by',
  },
  flaggedIssue: {
    en: 'Flagged issue',
    ru: 'Зафлагованая задача',
  },
};

const useCalcProgress = (
  subtasks: JiraIssueMapped[]
): Record<string, { progress: SubTasksProgress; comments: string[] }> => {
  const { settings } = useGetSettings();

  const texts = useGetTextsByLocale(TEXTS);
  const statusMapping = settings?.newStatusMapping || {};
  const groupingField = settings?.groupingField || 'project';
  const ignoredGroups = settings?.ignoredGroups || [];
  const { ignoredStatuses } = settings;
  const shouldUseCustomColorScheme = settings.useCustomColorScheme;

  const progress: Record<string, { progress: SubTasksProgress; comments: string[] }> = {};

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
    const group = issue[groupingField];
    if (ignoredGroups.includes(group)) {
      return;
    }

    const status: { name: string; progressStatus: Status } = shouldUseCustomColorScheme
      ? statusMapping[issue.statusId] || { name: issue.status, progressStatus: 'unmapped' }
      : { name: issue.status, progressStatus: mapStatusCategeoryToProgressStatus(issue.statusCategory) };

    if (status.progressStatus === 'ignored') {
      return;
    }

    if (ignoredStatuses.includes(issue.statusId)) {
      return;
    }

    if (!progress[group]) {
      progress[group] = createEmptyGroup();
    }
    if (issue.isFlagged && settings.flagsAsBlocked) {
      status.progressStatus = 'blocked';
      progress[group].comments.push(`${texts.flaggedIssue}: ${issue.key}`);
    }

    if (issue.isBlockedByLinks && settings.blockedByLinksAsBlocked) {
      status.progressStatus = 'blocked';
      progress[group].comments.push(`${texts.blockedByLinks}: ${issue.key}`);
    }

    if (status.progressStatus === 'unmapped') {
      progress[group].comments.push(`${texts.unmappedIssue}: ${issue.key}`);
    }

    progress[group].progress[status.progressStatus] += 1;
  };

  subtasks.forEach(mapIssue);

  return progress;
};

const useExternalIssuesProgress = (issueKey: string) => {
  const { settings } = useGetSettings();

  const progress: Record<string, { progress: SubTasksProgress; comments: string[] }> = {};
  const externalIssues = useJiraExternalIssuesStore(useShallow(state => state.data[issueKey]?.externalIssues));

  if (!externalIssues) {
    return progress;
  }
  const isEnabled =
    settings?.countIssuesExternalLinks || settings.countIssuesExternalLinks || settings.countSubtasksExternalLinks;
  if (!isEnabled) {
    return progress;
  }

  for (const externalIssue of externalIssues) {
    const group = `ext: ${externalIssue.project}`;
    if (!progress[group]) {
      progress[group] = createEmptyGroup();
    }

    const progressStatus = mapStatusCategoryColorToProgressStatus(externalIssue.statusColor);
    progress[group].progress[progressStatus] += 1;
  }
  return progress;
};

export const useSubtasksProgress = (issueKey: string) => {
  const subtasks = useGetSubtasksToCountProgress(issueKey);
  const progress = useCalcProgress(subtasks);
  const externalIssuesProgress = useExternalIssuesProgress(issueKey);
  return { ...progress, ...externalIssuesProgress };
};
