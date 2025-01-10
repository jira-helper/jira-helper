import { AvailableColorSchemas } from './colorSchemas';

export type Status = 'backlog' | 'todo' | 'inProgress' | 'almostDone' | 'done' | 'blocked' | 'unmapped';
export type SubTasksProgress = {
  [key in Status]: number;
};

/**
 * used to map statuses to colors
 */
export type ColorScheme = {
  [key in Status]: string;
};

export type GroupFields = 'project' | 'assignee' | 'reporter' | 'priority' | 'creator' | 'issueType';
export type BoardProperty = {
  columnsToTrack?: string[];
  groupingField?: GroupFields;
  statusMapping?: Record<string, Status>;
  selectedColorScheme?: AvailableColorSchemas;
};
