import type { Texts } from 'src/shared/texts';

export const PERSON_LIMITS_TEXTS = {
  modalTitle: {
    en: 'Personal WIP Limit',
    ru: 'WIP-лимиты на человека',
  },
  personJiraName: {
    en: 'Person JIRA name',
    ru: 'Имя пользователя в JIRA',
  },
  maxIssuesAtWork: {
    en: 'Max issues at work',
    ru: 'Максимум задач в работе',
  },
  selectPerson: {
    en: 'Select a person',
    ru: 'Выберите человека',
  },
  limitMinError: {
    en: 'Limit must be at least 1',
    ru: 'Лимит должен быть не меньше 1',
  },
  columns: {
    en: 'Columns',
    ru: 'Колонки',
  },
  swimlanes: {
    en: 'Swimlanes',
    ru: 'Свимлейны',
  },
  avatarWarning: {
    en: 'To work correctly, the person must have a Jira avatar.',
    ru: 'Чтобы WIP-лимиты на человека работали корректно, у пользователя должен быть установлен аватар.',
  },
  person: {
    en: 'Person',
    ru: 'Человек',
  },
  limit: {
    en: 'Limit',
    ru: 'Лимит',
  },
  issueTypes: {
    en: 'Issue Types',
    ru: 'Типы задач',
  },
  actions: {
    en: 'Actions',
    ru: 'Действия',
  },
  edit: {
    en: 'Edit',
    ru: 'Редактировать',
  },
  delete: {
    en: 'Delete',
    ru: 'Удалить',
  },
  allColumns: {
    en: 'All columns',
    ru: 'Все колонки',
  },
  allSwimlanes: {
    en: 'All swimlanes',
    ru: 'Все свимлейны',
  },
  allTypes: {
    en: 'All types',
    ru: 'Все типы',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  addLimit: {
    en: 'Add limit',
    ru: 'Добавить лимит',
  },
  updateLimit: {
    en: 'Update limit',
    ru: 'Обновить лимит',
  },
} as const satisfies Texts;

export type PersonLimitsTextKeys = keyof typeof PERSON_LIMITS_TEXTS;
