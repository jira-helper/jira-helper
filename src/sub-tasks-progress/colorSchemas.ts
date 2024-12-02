import { ColorScheme } from './types';

export const jiraColorScheme: ColorScheme = {
  blocked: 'red',
  backlog: 'gray',
  todo: 'lightblue',
  inProgress: 'blue',
  almostDone: 'yellowgreen',
  done: 'green',
};

export const yellowGreenColorScheme: ColorScheme = {
  blocked: 'red',
  backlog: 'gray',
  todo: 'lightblue',
  inProgress: 'yellow',
  almostDone: 'yellowgreen',
  done: 'green',
};

export const availableColorSchemas: string[] = ['jira', 'yellowGreen'];
