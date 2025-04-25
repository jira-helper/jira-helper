import { SubTasksProgress } from '../types';
import { jiraColorScheme } from '../colorSchemas';

const smallMixedProgress: SubTasksProgress = {
  todo: 1,
  inProgress: 1,
  almostDone: 1,
  done: 2,
  blocked: 1,
  unmapped: 1,
};

const smallMixedJiraTypesProgress: SubTasksProgress = {
  todo: 1,
  inProgress: 2,
  almostDone: 0,
  done: 2,
  blocked: 1,
  unmapped: 1,
};

const largeMixedProgress: SubTasksProgress = {
  todo: 8,
  inProgress: 12,
  almostDone: 7,
  done: 15,
  blocked: 2,
  unmapped: 4,
};

const largeSameStatusProgress: SubTasksProgress = {
  todo: 0,
  inProgress: 25,
  almostDone: 0,
  done: 0,
  blocked: 0,
  unmapped: 0,
};

const smallSameStatusProgress: SubTasksProgress = {
  todo: 3,
  inProgress: 0,
  almostDone: 0,
  done: 0,
  blocked: 0,
  unmapped: 0,
};

const emptyProgress: SubTasksProgress = {
  todo: 0,
  inProgress: 0,
  almostDone: 0,
  done: 0,
  blocked: 0,
  unmapped: 0,
};

export const defaultColorScheme = jiraColorScheme;

export const subTasksProgress = {
  smallMixed: smallMixedProgress,
  largeMixed: largeMixedProgress,
  largeSameStatus: largeSameStatusProgress,
  smallSameStatus: smallSameStatusProgress,
  empty: emptyProgress,
  smallMixedJiraTypes: smallMixedJiraTypesProgress,
};
