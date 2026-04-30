import type { Texts } from 'src/shared/texts';

export const JIRA_COMMENT_TEMPLATES_TEXTS = {
  toolbarLabel: {
    en: 'Templates:',
    ru: 'Шаблоны:',
  },
  insertTemplateAriaLabelPrefix: {
    en: 'Insert comment template:',
    ru: 'Вставить шаблон комментария:',
  },
  manageTemplates: {
    en: 'Manage templates',
    ru: 'Управлять шаблонами',
  },
  dismissNotification: {
    en: 'Dismiss comment templates notification',
    ru: 'Закрыть уведомление шаблонов комментариев',
  },
  insertFailed: {
    en: 'Template was not inserted',
    ru: 'Шаблон не был вставлен',
  },
  watchersAdded: {
    en: 'Watchers added',
    ru: 'Наблюдатели добавлены',
  },
  watchersPartiallyAdded: {
    en: 'Some watchers were not added',
    ru: 'Некоторые наблюдатели не были добавлены',
  },
  watchersFailed: {
    en: 'Watchers were not added',
    ru: 'Наблюдатели не были добавлены',
  },
  watchersSkippedMissingIssueKey: {
    en: 'Template inserted, but watchers were not added because the issue key is unavailable',
    ru: 'Шаблон вставлен, но наблюдатели не добавлены: ключ задачи недоступен',
  },
  watcherAddedStatus: {
    en: 'added',
    ru: 'добавлен',
  },
  watcherFailedStatus: {
    en: 'failed',
    ru: 'ошибка',
  },
  settingsTitle: {
    en: 'Comment templates',
    ru: 'Шаблоны комментариев',
  },
  addTemplate: {
    en: 'Add template',
    ru: 'Добавить шаблон',
  },
  resetToDefaults: {
    en: 'Reset to defaults',
    ru: 'Сбросить к стандартным',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  discard: {
    en: 'Discard',
    ru: 'Отменить',
  },
  emptySettingsState: {
    en: 'No templates in draft',
    ru: 'В черновике нет шаблонов',
  },
  importError: {
    en: 'Import error',
    ru: 'Ошибка импорта',
  },
  unsavedChanges: {
    en: 'Unsaved changes',
    ru: 'Есть несохранённые изменения',
  },
  noUnsavedChanges: {
    en: 'No unsaved changes',
    ru: 'Нет несохранённых изменений',
  },
  resetToDefaultsConfirm: {
    en: 'Reset draft templates to defaults?',
    ru: 'Сбросить черновик шаблонов к стандартным?',
  },
  resetToDefaultsConfirmAction: {
    en: 'Reset',
    ru: 'Сбросить',
  },
  confirmAction: {
    en: 'Confirm',
    ru: 'Подтвердить',
  },
  cancelAction: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  labelField: {
    en: 'Label',
    ru: 'Название',
  },
  colorField: {
    en: 'Color',
    ru: 'Цвет',
  },
  colorPresetPaletteLabel: {
    en: 'Suggested colors',
    ru: 'Рекомендуемые цвета',
  },
  textField: {
    en: 'Text',
    ru: 'Текст',
  },
  watchersField: {
    en: 'Watchers',
    ru: 'Наблюдатели',
  },
  watchersHelp: {
    en: 'Search and select Jira users to add as watchers.',
    ru: 'Найдите и выберите пользователей Jira, которых нужно добавить в наблюдатели.',
  },
  watchersPlaceholder: {
    en: 'Type to search users...',
    ru: 'Начните вводить имя пользователя...',
  },
  deleteTemplateAriaLabelPrefix: {
    en: 'Delete template:',
    ru: 'Удалить шаблон:',
  },
  importFile: {
    en: 'Import JSON file',
    ru: 'Импортировать JSON-файл',
  },
  exportTemplates: {
    en: 'Export templates',
    ru: 'Экспортировать шаблоны',
  },
  importing: {
    en: 'Importing...',
    ru: 'Импорт...',
  },
  saveError: {
    en: 'Save error',
    ru: 'Ошибка сохранения',
  },
  colorBlue: {
    en: 'Blue',
    ru: 'Синий',
  },
  colorGreen: {
    en: 'Green',
    ru: 'Зелёный',
  },
  colorYellow: {
    en: 'Yellow',
    ru: 'Жёлтый',
  },
  colorRed: {
    en: 'Red',
    ru: 'Красный',
  },
  colorPurple: {
    en: 'Purple',
    ru: 'Фиолетовый',
  },
} as const satisfies Texts;

export type JiraCommentTemplatesTextKey = keyof typeof JIRA_COMMENT_TEMPLATES_TEXTS;
