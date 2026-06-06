/**
 * WipLimitCell - базовая ячейка для WIP лимита.
 * Определяет ячейку доски (swimlane + column) и настройки отображения.
 *
 * @example
 * { swimlane: "swimlane-1", column: "column-1", showBadge: true }
 */
export type WipLimitCell = {
  /** ID swimlane (дорожки) */
  swimlane: string;
  /** ID колонки */
  column: string;
  /** Показывать ли badge с количеством issues */
  showBadge: boolean;
};

/**
 * WipLimitCellRuntime - ячейка с runtime-полями для отображения на доске.
 * Расширяет WipLimitCell дополнительными полями, которые заполняются
 * во время рендеринга на доске.
 */
export type WipLimitCellRuntime = WipLimitCell & {
  /** DOM-элемент ячейки на доске */
  DOM?: Element;
  /** Координата X в матрице ячеек (swimlane index) */
  x?: number;
  /** Координата Y в матрице ячеек (column index) */
  y?: number;
  /** Флаг: ячейка не найдена на доске */
  notFoundOnBoard?: boolean;
  /** Строка с границами диапазона (T/B/L/R - top/bottom/left/right) */
  border?: string;
};

/**
 * WipLimitRange - диапазон ячеек с WIP лимитом.
 * Определяет группу ячеек (cells) с общим лимитом и настройками.
 * Хранится в Jira Board Property.
 *
 * @example
 * {
 *   name: "Development Range",
 *   wipLimit: 5,
 *   disable: false,
 *   cells: [{ swimlane: "swimlane-1", column: "column-1", showBadge: true }],
 *   includedIssueTypes: ["Bug", "Story"]
 * }
 */
export type WipLimitRange = {
  /** Название диапазона */
  name: string;
  /** WIP лимит для диапазона */
  wipLimit: number;
  /** Отключить ли визуализацию диапазона */
  disable?: boolean;
  /** Массив ячеек в диапазоне */
  cells: WipLimitCell[];
  /** Типы issues, которые учитываются в лимите (если не указано - все типы) */
  includedIssueTypes?: string[];
  /** Матрица диапазона для визуализации границ (runtime поле, не сохраняется) */
  matrixRange?: any[];
};

/**
 * BoardData - данные доски Jira для работы с WIP лимитами.
 * Получается через getBoardEditData() API.
 */
export type BoardData = {
  /** Конфигурация swimlanes (дорожек) */
  swimlanesConfig: {
    swimlanes: Array<{ id: string; name: string }>;
  };
  /** Конфигурация колонок */
  rapidListConfig: {
    mappedColumns: Array<{ id: string; name: string; isKanPlanColumn: boolean }>;
  };
  /** Может ли пользователь редактировать настройки */
  canEdit: boolean;
};

/**
 * WipLimitSettings - устаревший тип для обратной совместимости.
 * Используется в WiplimitOnCellsSettingsPopup для преобразования данных.
 * @deprecated Используйте WipLimitRange вместо этого типа
 */
export type WipLimitSettings = {
  cells: Array<{ column: string; showBadge: boolean; swimlane: string }>;
  name: string;
  wipLimit: number;
  includedIssueTypes?: string[];
};
