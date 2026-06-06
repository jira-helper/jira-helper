import type { Texts } from 'src/shared/texts';

export const SWIMLANE_WIP_LIMITS_TEXTS = {
  modalTitle: {
    en: 'Swimlane WIP Limits',
    ru: 'WIP-лимиты свимлейнов',
  },
  settingsButton: {
    en: 'Configure WIP Limits',
    ru: 'Настроить WIP-лимиты',
  },
  ok: {
    en: 'OK',
    ru: 'ОК',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  countAllIssueTypes: {
    en: 'Count all issue types',
    ru: 'Считать все типы задач',
  },
  selectedIssueTypes: {
    en: 'Selected issue types:',
    ru: 'Выбранные типы задач:',
  },
  projectKeyHint: {
    en: 'Enter project key to load issue types (auto-loads after typing):',
    ru: 'Введите ключ проекта для загрузки типов задач (загрузка автоматически):',
  },
  projectKeyLabel: {
    en: 'Project Key:',
    ru: 'Ключ проекта:',
  },
  projectKeyPlaceholder: {
    en: 'Enter project key (e.g., PROJ)',
    ru: 'Введите ключ проекта (напр., PROJ)',
  },
  loadingIssueTypes: {
    en: 'Loading issue types...',
    ru: 'Загрузка типов задач...',
  },
  issueTypesFromProject: {
    en: 'Issue types from project',
    ru: 'Типы задач из проекта',
  },
  selectTypesHint: {
    en: 'Select types from this project to add to your selection above',
    ru: 'Выберите типы из этого проекта для добавления к выбранным выше',
  },
  noIssueTypesFound: {
    en: 'No issue types found. Click "Load Types" to fetch types for project',
    ru: 'Типы задач не найдены. Нажмите "Загрузить типы" для получения типов проекта',
  },
  enterProjectKey: {
    en: 'Please enter a project key',
    ru: 'Введите ключ проекта',
  },
  noTypesForProject: {
    en: 'No issue types found for project',
    ru: 'Типы задач не найдены для проекта',
  },
  failedToLoadTypes: {
    en: 'Failed to load issue types',
    ru: 'Не удалось загрузить типы задач',
  },
  subtask: {
    en: 'Subtask',
    ru: 'Подзадача',
  },
  remove: {
    en: 'Remove',
    ru: 'Удалить',
  },
} as const satisfies Texts;

export type SwimlaneWipLimitsTextKeys = keyof typeof SWIMLANE_WIP_LIMITS_TEXTS;
