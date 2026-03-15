/**
 * @module FieldLimitsTypes
 *
 * Типы для фичи Field WIP Limits.
 * Хранится в Jira Board Property `fieldLimitsJH`.
 *
 * ## Типы подсчёта (CalcType):
 * - has_field — считаем карточки с этим значением
 * - exact_value — точное совпадение значения
 * - multiple_values — считаем если любое из значений совпадает
 * - sum_numbers — суммируем числовые значения
 */

/** Типы подсчёта задач */
export const CalcType = {
  HAS_FIELD: 'has_field',
  EXACT_VALUE: 'exact_value',
  MULTIPLE_VALUES: 'multiple_values',
  SUM_NUMBERS: 'sum_numbers',
} as const;
export type CalcType = (typeof CalcType)[keyof typeof CalcType];

/** Один лимит для конкретного field value */
export interface FieldLimit {
  calcType: CalcType;
  fieldValue: string;
  fieldId: string;
  limit: number;
  /** ID колонок, где применяется лимит */
  columns: string[];
  /** ID swimlanes, где применяется лимит */
  swimlanes: string[];
  /** Кастомный цвет фона для badge */
  bkgColor?: string;
  /** Отображаемое имя на badge */
  visualValue: string;
}

/** Все настройки field limits для доски */
export interface FieldLimitsSettings {
  limits: Record<string, FieldLimit>;
}

/** Статистика одного лимита на доске (runtime) */
export interface FieldLimitStats {
  current: number;
  limit: number;
  isOverLimit: boolean;
  isOnLimit: boolean;
  calcType: CalcType;
  issues: Array<{ issue: Element; countValues: number }>;
}

/** Поле из card layout настроек Jira */
export interface CardLayoutField {
  fieldId: string;
  name: string;
}

/** Колонка доски */
export interface BoardColumn {
  id: string;
  name: string;
}

/** Swimlane доски */
export interface BoardSwimlane {
  id: string;
  name: string;
}

/** Входные данные формы создания/редактирования лимита */
export interface LimitFormInput {
  calcType: CalcType;
  fieldId: string;
  fieldValue: string;
  visualValue: string;
  limit: number;
  columns: string[];
  swimlanes: string[];
}

/** Данные доски из Jira API */
export interface BoardEditData {
  canEdit: boolean;
  rapidListConfig: {
    mappedColumns: Array<BoardColumn & { isKanPlanColumn: boolean }>;
    currentStatisticsField?: { typeId: string };
  };
  swimlanesConfig: {
    swimlanes: BoardSwimlane[];
  };
  cardLayoutConfig: {
    currentFields: CardLayoutField[];
  };
}

/** Состояние загрузки */
export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';
