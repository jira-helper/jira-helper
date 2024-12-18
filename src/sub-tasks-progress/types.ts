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