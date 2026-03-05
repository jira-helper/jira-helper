/**
 * @module SwimlaneWipLimitsTypes
 *
 * Типы для фичи Swimlane WIP Limits.
 *
 * ## Конвенции
 * - `includedIssueTypes: undefined` — все типы задач
 * - `includedIssueTypes: []` — никакие типы (лимит отключен)
 * - `limit: undefined` — лимит не установлен
 */

/**
 * Настройки одного swimlane.
 */
export interface SwimlaneSetting {
  /** WIP лимит. undefined = лимит не установлен */
  limit?: number;

  /**
   * Колонки для подсчёта задач в лимите.
   * - []: все колонки (по умолчанию)
   * - ['In Progress', 'Review']: только указанные колонки
   */
  columns: string[];

  /**
   * Типы задач, которые считаются в лимите.
   * - undefined: все типы
   * - []: никакие (лимит отключен)
   * - ['Bug', 'Task']: только указанные
   */
  includedIssueTypes?: string[];
}

/**
 * Все настройки swimlanes для доски.
 * Ключ — swimlaneId из Jira DOM.
 */
export type SwimlaneSettings = {
  [swimlaneId: string]: SwimlaneSetting;
};

/**
 * Информация о swimlane из Jira DOM/API.
 */
export interface Swimlane {
  id: string;
  name: string;
}

/**
 * Статистика swimlane на доске (runtime).
 */
export interface SwimlaneIssueStats {
  count: number;
  columnCounts: number[];
  isOverLimit: boolean;
}

/**
 * Состояние загрузки для всех моделей.
 */
export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';

/**
 * Данные доски из Jira API (getBoardEditData).
 */
export interface BoardData {
  canEdit: boolean;
  swimlanesConfig: {
    swimlanes: Swimlane[];
  };
}
