import { ExternalIssueMapped } from 'src/shared/jira/types';
import { ActiveStatuses, ColorScheme } from './types';

export const availableStatuses: ActiveStatuses[] = ['blocked', 'todo', 'inProgress', 'done'];

export const jiraColorScheme: ColorScheme = {
  blocked: 'red',
  todo: 'gray',
  inProgress: 'blue',
  done: 'green',
};

export const availableColorSchemas = ['jira'] as const;
export type AvailableColorSchemas = (typeof availableColorSchemas)[number];

export const colorSchemas: Record<AvailableColorSchemas, ColorScheme> = {
  jira: jiraColorScheme,
};

export const mapStatusCategoryColorToProgressStatus = (
  statusCategoryColor: ExternalIssueMapped['statusColor']
): ActiveStatuses | null => {
  switch (statusCategoryColor) {
    case 'green':
      return 'done';
    case 'yellow':
      return 'inProgress';
    case 'blue-gray':
      return 'todo';
    default:
      return null;
  }
};
