/**
 * Interface for WipLimitCells BoardPage DOM operations.
 *
 * All DOM access is encapsulated here to:
 * - Decouple actions from Jira DOM structure
 * - Enable easy mocking in tests
 * - Centralize DOM selectors
 */
export interface IWipLimitCellsBoardPageObject {
  selectors: {
    swimlane: string; // '.ghx-swimlane'
    column: string; // '.ghx-column'
  };

  // === QUERIES (чтение DOM) ===

  /**
   * Получить все ячейки доски как 2D массив [swimlane][column].
   * Каждая ячейка - это DOM-элемент колонки внутри swimlane.
   */
  getAllCells(): Element[][];

  /**
   * Получить DOM-элемент конкретной ячейки по ID swimlane и column.
   * Использует селектор: `[swimlane-id='${swimlaneId}'] [data-column-id='${columnId}']`
   */
  getCellElement(swimlaneId: string, columnId: string): Element | null;

  /**
   * Получить issues внутри ячейки по CSS-селектору.
   * Используется для подсчёта количества issues в ячейке.
   */
  getIssuesInCell(cell: Element, cssSelector: string): Element[];

  // === COMMANDS (мутация DOM) ===

  /**
   * Добавить CSS-класс на ячейку.
   * Используется для добавления классов границ (left, right, top, bottom) и статусов (Respected, NotRespected).
   */
  addCellClass(cell: Element, className: string): void;

  /**
   * Убрать CSS-класс с ячейки.
   */
  removeCellClass(cell: Element, className: string): void;

  /**
   * Установить background color на ячейку.
   * Используется для подсветки ячеек с превышением лимита (#ff563070).
   */
  setCellBackgroundColor(cell: Element, color: string): void;

  /**
   * Вставить HTML badge в начало ячейки.
   * Использует insertAdjacentHTML('afterbegin', html) для вставки badge с счётчиком issues/limit.
   */
  insertBadge(cell: Element, html: string): void;
}
