import { SubTasksProgress } from './types';
import { jiraColorScheme } from './colorSchemas';

const smallMixedProgress: SubTasksProgress = {
  backlog: 1,
  todo: 1,
  inProgress: 1,
  almostDone: 1,
  done: 2,
  blocked: 1,
  unmapped: 1,
};

const largeMixedProgress: SubTasksProgress = {
  backlog: 5,
  todo: 8,
  inProgress: 12,
  almostDone: 7,
  done: 15,
  blocked: 2,
  unmapped: 4,
};

const largeSameStatusProgress: SubTasksProgress = {
  backlog: 0,
  todo: 0,
  inProgress: 25,
  almostDone: 0,
  done: 0,
  blocked: 0,
  unmapped: 0,
};

const smallSameStatusProgress: SubTasksProgress = {
  backlog: 0,
  todo: 3,
  inProgress: 0,
  almostDone: 0,
  done: 0,
  blocked: 0,
  unmapped: 0,
};

const emptyProgress: SubTasksProgress = {
  backlog: 0,
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
};
