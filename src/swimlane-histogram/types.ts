/**
 * @module SwimlaneHistogramTypes
 *
 * Типы для фичи Swimlane Histogram.
 */

/**
 * Статистика по одной колонке в гистограмме.
 */
export interface ColumnStats {
  /** Название колонки */
  columnName: string;
  /** Количество задач */
  issueCount: number;
}

/**
 * Данные гистограммы для одного swimlane.
 */
export interface SwimlaneHistogram {
  /** ID swimlane */
  swimlaneId: string;
  /** Общее количество задач */
  totalIssues: number;
  /** Статистика по колонкам */
  columns: ColumnStats[];
}

/**
 * Состояние загрузки.
 */
export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';
