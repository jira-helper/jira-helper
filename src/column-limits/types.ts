/**
 * @module column-limits/types
 *
 * Доменные типы для фичи WIP-лимитов по колонкам (группам колонок).
 */

/**
 * Настройки WIP-лимита для одной группы колонок.
 * Хранится в Jira Board Property (WIP_LIMITS_SETTINGS).
 *
 * @example
 * {
 *   columns: ["10001", "10002"],
 *   max: 5,
 *   customHexColor: "#ff5630",
 *   includedIssueTypes: ["Task", "Bug"]
 * }
 */
export type ColumnLimitGroup = {
  columns: string[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
};

/**
 * Полное свойство WIP limits в Jira.
 * Ключ — идентификатор группы (имя или сгенерированный id).
 */
export type WipLimitsProperty = Record<string, ColumnLimitGroup>;

/**
 * Колонка в UI (id + отображаемое имя).
 */
export type Column = {
  id: string;
  name: string;
};

/**
 * Группа колонок в UI-редакторе настроек.
 */
export type UIGroup = {
  id: string;
  columns: Column[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
};

/**
 * Состояние селектора типов задач для одной группы.
 */
export type IssueTypeState = {
  countAllTypes: boolean;
  projectKey: string;
  selectedTypes: string[];
};

/** Идентификатор зоны "колонки без группы". */
export const WITHOUT_GROUP_ID = 'Without Group';
