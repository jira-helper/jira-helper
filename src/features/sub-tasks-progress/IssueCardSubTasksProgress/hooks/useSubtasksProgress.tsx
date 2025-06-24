import { JiraField, JiraIssueMapped } from 'src/shared/jira/types';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';

import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { ActiveStatuses, SubTasksProgress } from '../../types';
import { useGetSettings } from '../../SubTaskProgressSettings/hooks/useGetSettings';
import { mapStatusCategoryColorToProgressStatus } from '../../colorSchemas';
import { CustomGroup } from '../../BoardSettings/GroupingSettings/CustomGroups/types';

export const useGetSubtasksToCountProgress = (issueId: string) => {
  const { settings } = useGetSettings();
  const issue = useJiraIssuesStore(
    useShallow(state => {
      return state.issues.find(i => i.data.key === issueId);
    })
  );

  const subtasks = useJiraSubtasksStore(useShallow(state => state.data[issueId]));
  const issueLinks = (issue?.data.fields.issuelinks as JiraIssueMapped['fields']['issuelinks'][]) || [];

  // Filter issue links by selected types/directions
  let filteredIssueLinks = issueLinks;
  const selectedLinkTypes = settings.issueLinkTypesToCount;
  if (selectedLinkTypes && selectedLinkTypes.length > 0) {
    filteredIssueLinks = issueLinks.filter(link => {
      return selectedLinkTypes.some(sel => {
        if (sel.direction === 'inward' && link.inwardIssue && link.type.id === sel.id) return true;
        if (sel.direction === 'outward' && link.outwardIssue && link.type.id === sel.id) return true;
        return false;
      });
    });
  }

  const linkedIssuesKeys =
    filteredIssueLinks
      .map(link => {
        const linkedIssue = link.outwardIssue || link.inwardIssue;
        if (!linkedIssue) {
          return;
        }
        return linkedIssue.key;
      })
      .filter(v => v !== undefined) || [];

  const issueSubtasksData = (issue?.data.fields.subtasks as JiraIssueMapped['fields']['subtasks'][]) || [];
  const subtasksKeys = issueSubtasksData.map(s => s.key).filter(v => v !== undefined) || [];

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
    done: 0,
    blocked: 0,
  },
  comments: [],
});

const TEXTS = {
  blockedByLinks: {
    en: 'Blocked by links',
    ru: 'Заблокировано ссылкой blocked by',
  },
  flaggedIssue: {
    en: 'Flagged issue',
    ru: 'Зафлагованая задача',
  },
};

const getFieldValue = (issue: JiraIssueMapped, cg: CustomGroup, fields: JiraField[]): any[] => {
  const field = fields.find(f => f.id === cg.fieldId);
  if (!field) return [];
  const val = issue.fields[field.id];
  switch (field.schema?.type) {
    // by value
    case 'string':
    case 'option':
      return val && val.value !== undefined ? [val.value] : [];
    // by key
    case 'project':
      return val && val.key !== undefined ? [val.key] : [];
    // by name
    case 'priority':
    case 'status':
    case 'issuetype':
      return val && val.name !== undefined ? [val.name] : [];
    case 'user': {
      const arr = [];
      if (val?.displayName) arr.push(val.displayName);
      if (val?.emailAddress) arr.push(val.emailAddress);
      if (val?.name) arr.push(val.name);
      return arr;
    }
    case 'array': {
      switch (field.schema.items) {
        case 'component':
        case 'string':
        case 'option':
          if (!val) return [];
          return val.map((v: { name: string }) => v.name);
        default:
          return [];
      }
    }
    default:
      return [];
  }
};

// Utility: getFieldValueForJqlStandalone for use in JQL debug/demo
export function getFieldValueForJqlStandalone(issue: JiraIssueMapped, fields: JiraField[]) {
  return (fieldName: string) => {
    const lowerFieldName = fieldName.toLowerCase();
    const field = fields.find(
      f =>
        f.id.toLowerCase() === lowerFieldName ||
        f.name.toLowerCase() === lowerFieldName ||
        (f.clauseNames && f.clauseNames.some(cn => cn.toLowerCase() === lowerFieldName))
    );
    if (!field) return [];
    // Use getFieldValue to get all possible values, but JQL expects a single value, so return the array
    return getFieldValue(issue, { fieldId: field.id } as any, fields);
  };
}

const matchToCustomGroupByField = (issue: JiraIssueMapped, cg: CustomGroup, fields: JiraField[]) => {
  const values = getFieldValue(issue, cg, fields);
  return values.some(v => v === cg.value);
};

const mapStatusCategeoryToProgressStatus = (statusCategory: JiraIssueMapped['statusCategory']) => {
  if (statusCategory === 'new') {
    return 'todo';
  }
  if (statusCategory === 'indeterminate') {
    return 'inProgress';
  }
  return 'done';
};

function calcProgress(
  subtasks: JiraIssueMapped[],
  settings: {
    flagsAsBlocked: boolean;
    blockedByLinksAsBlocked: boolean;
  },
  texts: {
    flaggedIssue: string;
    blockedByLinks: string;
  }
): { progress: SubTasksProgress; comments: string[] } {
  const progress: SubTasksProgress = {
    todo: 0,
    inProgress: 0,
    done: 0,
    blocked: 0,
  };
  const comments: string[] = [];
  for (const issue of subtasks) {
    const status: { name: string; progressStatus: ActiveStatuses } = {
      name: issue.status,
      progressStatus: mapStatusCategeoryToProgressStatus(issue.statusCategory),
    };

    if (issue.isFlagged && settings.flagsAsBlocked) {
      status.progressStatus = 'blocked';
      comments.push(`${texts.flaggedIssue}: ${issue.key}`);
    }

    if (issue.isBlockedByLinks && settings.blockedByLinksAsBlocked) {
      status.progressStatus = 'blocked';
      comments.push(`${texts.blockedByLinks}: ${issue.key}`);
    }

    progress[status.progressStatus] += 1;
  }

  return {
    progress,
    comments,
  };
}

const useCalcProgress = (
  subtasks: JiraIssueMapped[]
): Record<string, { progress: SubTasksProgress; comments: string[]; showAsBadge?: boolean }> => {
  const { settings } = useGetSettings();

  const texts = useGetTextsByLocale(TEXTS);

  const groupingField = settings?.groupingField || 'project';
  const ignoredGroups = settings?.ignoredGroups || [];

  const progress: Record<string, { progress: SubTasksProgress; comments: string[] }> = {};

  const subtasksGrouppedByGrouppingField = subtasks.reduce(
    (acc, issue) => {
      const groupingFieldsMapping = {
        project: 'project',
        assignee: 'assignee',
        issueType: 'issueTypeName',
        reporter: 'reporter',
        creator: 'creator',
        priority: 'priority',
        status: 'status',
        statusCategory: 'statusCategory',
        created: 'created',
        updated: 'updated',
      } as const;
      const jiraGroupingField = groupingFieldsMapping[groupingField];
      const group = issue[jiraGroupingField];

      if (ignoredGroups.includes(group)) {
        return acc;
      }
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(issue);
      return acc;
    },
    {} as Record<string, JiraIssueMapped[]>
  );

  for (const group in subtasksGrouppedByGrouppingField) {
    const groupProgress = calcProgress(subtasksGrouppedByGrouppingField[group], settings, texts);
    progress[group] = groupProgress;
  }

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
    if (!progressStatus) {
      continue;
    }

    progress[group].progress[progressStatus] += 1;
  }
  return progress;
};

export type SubTasksProgressByGroup = Record<string, { progress: SubTasksProgress; comments: string[] }>;
export const useSubtasksProgress = (issueKey: string): SubTasksProgressByGroup => {
  const { settings } = useGetSettings();
  if (!settings.enableGroupByField) {
    return {};
  }
  const subtasks = useGetSubtasksToCountProgress(issueKey);
  const progress = useCalcProgress(subtasks);
  const externalIssuesProgress = useExternalIssuesProgress(issueKey);
  return { ...progress, ...externalIssuesProgress };
};

export type SubTasksCounterProgressByGroup = Record<
  CustomGroup['id'],
  { progress: SubTasksProgress; comments: string[] }
>;
export const useSubtasksProgressByCustomGroup = (issueKey: string): SubTasksCounterProgressByGroup => {
  const subtasks = useGetSubtasksToCountProgress(issueKey);
  const {
    settings: { customGroups, flagsAsBlocked, blockedByLinksAsBlocked },
  } = useGetSettings();
  const { fields } = useGetFields();
  const texts = useGetTextsByLocale(TEXTS);

  const progress: SubTasksCounterProgressByGroup = {};

  for (const cg of customGroups) {
    let groupSubtasks: JiraIssueMapped[] = [];
    if (cg.mode === 'jql') {
      let matchFn: ReturnType<typeof parseJql> | null = null;
      if (cg.jql) {
        try {
          matchFn = parseJql(cg.jql);
        } catch {
          // console.log('invalid JQL', cg.jql);
          continue; // skip invalid JQL
        }
        groupSubtasks = subtasks.filter(subtask => matchFn!(getFieldValueForJqlStandalone(subtask, fields)));
        // console.log('🚀 ~ useSubtasksProgressByCustomGroup ~ groupSubtasks:', groupSubtasks);
      }
    } else if (cg.mode === 'field') {
      groupSubtasks = subtasks.filter(subtask => matchToCustomGroupByField(subtask, cg, fields));
    }
    const progressOfSubtasks = calcProgress(
      groupSubtasks,
      {
        flagsAsBlocked,
        blockedByLinksAsBlocked,
      },
      texts
    );
    const total = Object.values(progressOfSubtasks.progress).reduce((acc, curr) => acc + curr, 0);
    if (total > 0) {
      progress[cg.id] = progressOfSubtasks;
    }
  }

  return progress;
};
