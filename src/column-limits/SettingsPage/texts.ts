import type { Texts } from 'src/shared/texts';

export const COLUMN_LIMITS_TEXTS = {
  modalTitle: {
    en: 'Limits for groups',
    ru: 'Лимиты для групп',
  },
  limitForGroup: {
    en: 'Limit for group:',
    ru: 'Лимит для группы:',
  },
  swimlanes: {
    en: 'Swimlanes',
    ru: 'Свимлейны',
  },
  allSwimlanes: {
    en: 'All swimlanes',
    ru: 'Все свимлейны',
  },
  withoutGroup: {
    en: 'Without Group',
    ru: 'Без группы',
  },
  dragColumnToCreateGroup: {
    en: 'Drag column over here to create group',
    ru: 'Перетащите колонку сюда для создания группы',
  },
  selectColor: {
    en: 'Select color',
    ru: 'Выберите цвет',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
} as const satisfies Texts;

export type ColumnLimitsTextKeys = keyof typeof COLUMN_LIMITS_TEXTS;
