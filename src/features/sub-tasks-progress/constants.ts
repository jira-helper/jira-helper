import { SubTasksProgress } from './types';

export const StatusNamesTexts: Record<keyof SubTasksProgress, { en: string; ru: string }> = {
  todo: {
    en: 'To Do',
    ru: 'К выполнению',
  },
  inProgress: {
    en: 'In Progress',
    ru: 'В работе',
  },

  done: {
    en: 'Done',
    ru: 'Выполнено',
  },
  blocked: {
    en: 'Blocked',
    ru: 'Заблокировано',
  },
};
