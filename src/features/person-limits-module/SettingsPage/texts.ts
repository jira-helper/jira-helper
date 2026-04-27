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
  persons: {
    en: 'Persons',
    ru: 'Пользователи',
  },
  selectAtLeastOnePerson: {
    en: 'Select at least one person',
    ru: 'Выберите хотя бы одного пользователя',
  },
  personsPlaceholder: {
    en: 'Type to search and add users...',
    ru: 'Введите имя пользователя для поиска...',
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
  settingsButton: {
    en: 'Manage per-person WIP-limits',
    ru: 'WIP-лимиты на человека',
  },
  tabTitle: {
    en: 'Person WIP Limits',
    ru: 'WIP-лимиты на человека',
  },
  saveConfig: {
    en: 'Save configuration',
    ru: 'Сохранить конфигурацию',
  },
  discardChanges: {
    en: 'Discard changes',
    ru: 'Отменить изменения',
  },
  showAllPersonIssues: {
    en: 'Show all person issues on avatar click',
    ru: 'При клике на аватар показывать все задачи пользователя',
  },
  showAllPersonIssuesShort: {
    en: 'Avatar click',
    ru: 'Клик по аватару',
  },
  showAllPersonIssuesTooltip: {
    en: 'Clicking on the avatar hides issues of other people on the board. If enabled, all issues of this person will remain. If disabled, only issues matching the limit settings (columns, swimlanes, issue types) will remain.',
    ru: 'Клик на аватар скрывает чужие задачи на доске. Если опция включена — останутся все задачи этого человека. Если выключена — только задачи, подходящие под настройки лимита (колонки, свимлейны, типы задач).',
  },
  sharedLimit: {
    en: 'Shared limit across all selected persons',
    ru: 'Общий лимит на всех выбранных пользователей',
  },
  sharedLimitTooltip: {
    en: 'When enabled, the limit applies as a single shared bucket: every avatar shows the same total/limit counter and clicking any avatar highlights tasks of all selected persons. When disabled, each person has their own counter and click highlight.',
    ru: 'Если включено, лимит работает как единая общая корзина: все аватары показывают общий счётчик total/limit, и клик по любому из них подсвечивает задачи всех выбранных пользователей. Если выключено — у каждого пользователя свой счётчик и своя подсветка при клике.',
  },
  sharedSuffix: {
    en: 'shared',
    ru: 'общий',
  },
} as const satisfies Texts;

export type PersonLimitsTextKeys = keyof typeof PERSON_LIMITS_TEXTS;
