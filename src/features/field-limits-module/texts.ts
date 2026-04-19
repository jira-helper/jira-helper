import type { Texts } from 'src/shared/texts';

export const FIELD_LIMITS_TEXTS = {
  settingsButton: {
    en: 'Edit WIP limits by field',
    ru: 'WIP-лимиты по полям',
  },
  modalTitle: {
    en: 'Field WIP Limits',
    ru: 'WIP-лимиты по полям',
  },
  field: {
    en: 'Field',
    ru: 'Поле',
  },
  selectField: {
    en: 'Select field',
    ru: 'Выберите поле',
  },
  calculationType: {
    en: 'Calculation type',
    ru: 'Тип подсчёта',
  },
  calcHasField: {
    en: 'Cards with filled field',
    ru: 'Карточки с заполненным полем',
  },
  calcExactValue: {
    en: 'Cards with exact value',
    ru: 'Карточки с точным значением',
  },
  calcMultipleValues: {
    en: 'Cards with any of values',
    ru: 'Карточки с любым из значений',
  },
  calcSumNumbers: {
    en: 'Sum of numeric field',
    ru: 'Сумма числового поля',
  },
  fieldValue: {
    en: 'Field value',
    ru: 'Значение поля',
  },
  fieldValues: {
    en: 'Field values',
    ru: 'Значения поля',
  },
  typeValuePlaceholder: {
    en: 'Type value and press Enter',
    ru: 'Введите значение и нажмите Enter',
  },
  visualName: {
    en: 'Visual name',
    ru: 'Отображаемое имя',
  },
  visualNamePlaceholder: {
    en: 'Visual name (displayed on badge)',
    ru: 'Имя (отображается на бейдже)',
  },
  wipLimit: {
    en: 'WIP Limit',
    ru: 'WIP-лимит',
  },
  columns: {
    en: 'Columns',
    ru: 'Колонки',
  },
  columnsPlaceholder: {
    en: 'Columns (all if empty)',
    ru: 'Колонки (все, если пусто)',
  },
  swimlanes: {
    en: 'Swimlanes',
    ru: 'Свимлейны',
  },
  swimlanesPlaceholder: {
    en: 'Swimlanes (all if empty)',
    ru: 'Свимлейны (все, если пусто)',
  },
  addLimit: {
    en: 'Add limit',
    ru: 'Добавить лимит',
  },
  editLimit: {
    en: 'Edit limit',
    ru: 'Редактировать лимит',
  },
  value: {
    en: 'Value',
    ru: 'Значение',
  },
  name: {
    en: 'Name',
    ru: 'Имя',
  },
  limit: {
    en: 'Limit',
    ru: 'Лимит',
  },
  actions: {
    en: 'Actions',
    ru: 'Действия',
  },
  all: {
    en: 'All',
    ru: 'Все',
  },
  tooltipCurrent: {
    en: 'current',
    ru: 'текущее',
  },
  tooltipLimit: {
    en: 'limit',
    ru: 'лимит',
  },
  tooltipFieldName: {
    en: 'field name',
    ru: 'имя поля',
  },
  tooltipFieldValue: {
    en: 'field value',
    ru: 'значение поля',
  },
} as const satisfies Texts;

export type FieldLimitsTextKeys = keyof typeof FIELD_LIMITS_TEXTS;
