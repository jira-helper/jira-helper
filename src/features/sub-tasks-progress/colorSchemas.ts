import { ExternalIssueMapped } from 'src/shared/jira/types';
import { ActiveStatuses, ColorScheme } from './types';

export const availableStatuses: ActiveStatuses[] = ['unmapped', 'blocked', 'todo', 'inProgress', 'almostDone', 'done'];

export const jiraColorScheme: ColorScheme = {
  blocked: 'red',
  todo: 'gray',
  inProgress: 'blue',
  almostDone: 'yellowgreen',
  done: 'green',
  unmapped: 'black',
};

export const yellowGreenColorScheme: ColorScheme = {
  blocked: 'red',
  todo: 'gray',
  inProgress: 'yellow',
  almostDone: 'yellowgreen',
  done: 'green',
  unmapped: 'black',
};

export const availableColorSchemas = ['jira', 'yellowGreen'] as const;
export type AvailableColorSchemas = (typeof availableColorSchemas)[number];

export const colorSchemas: Record<AvailableColorSchemas, ColorScheme> = {
  jira: jiraColorScheme,
  yellowGreen: yellowGreenColorScheme,
};

export const mapStatusCategoryColorToProgressStatus = (
  statusCategoryColor: ExternalIssueMapped['statusColor']
): ActiveStatuses => {
  switch (statusCategoryColor) {
    case 'green':
      return 'done';
    case 'yellow':
      return 'inProgress';
    case 'blue-gray':
      return 'todo';
    default:
      return 'unmapped';
  }
};
