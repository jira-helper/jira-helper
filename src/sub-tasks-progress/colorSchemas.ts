import { ColorScheme, Status } from './types';

export const availableStatuses: Status[] = [
  'unmapped',
  'blocked',
  'backlog',
  'todo',
  'inProgress',
  'almostDone',
  'done',
];

export const jiraColorScheme: ColorScheme = {
  blocked: 'red',
  backlog: 'gray',
  todo: 'lightblue',
  inProgress: 'blue',
  almostDone: 'yellowgreen',
  done: 'green',
  unmapped: 'black',
};

export const yellowGreenColorScheme: ColorScheme = {
  blocked: 'red',
  backlog: 'gray',
  todo: 'lightblue',
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
