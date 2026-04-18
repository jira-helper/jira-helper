import { createAction } from 'src/shared/action';
import type { WipLimitCellRuntime, WipLimitRange } from '../../types';
import type { IWipLimitCellsBoardPageObject } from '../pageObject';
import { wipLimitCellsBoardPageObjectToken } from '../pageObject';
import { useWipLimitCellsRuntimeStore } from '../stores';
import { getEmptyMatrix, cloneMatrix, findCellCoordinates, invertMatrix } from '../utils/matrix';
import { calculateBorders } from '../utils/borders';
import { getBadgeColor, getBadgeHtml } from '../utils/badge';

/**
 * Функция для фильтрации issues по типу.
 * Используется для определения, нужно ли учитывать issue в подсчёте лимита.
 */
type ShouldCountIssueFn = (issue: Element, includedIssueTypes?: string[]) => boolean;

/**
 * Добавляет CSS-классы границ к ячейке.
 *
 * @param cell - DOM-элемент ячейки
 * @param border - строка с границами (T/B/L/R)
 * @param pageObject - PageObject для работы с DOM
 */
function addCellBorderClasses(cell: Element, border: string, pageObject: IWipLimitCellsBoardPageObject): void {
  if (border.indexOf('L') !== -1) {
    pageObject.addCellClass(cell, 'WipLimitCellsRange_left');
  }
  if (border.indexOf('R') !== -1) {
    pageObject.addCellClass(cell, 'WipLimitCellsRange_right');
  }
  if (border.indexOf('T') !== -1) {
    pageObject.addCellClass(cell, 'WipLimitCellsRange_top');
  }
  if (border.indexOf('B') !== -1) {
    pageObject.addCellClass(cell, 'WipLimitCellsRange_bottom');
  }
}

/**
 * Добавляет CSS-классы статуса лимита к ячейке.
 * Если лимит превышен, также устанавливает background color.
 *
 * @param cell - DOM-элемент ячейки
 * @param countIssues - текущее количество issues
 * @param wipLimit - установленный WIP лимит
 * @param pageObject - PageObject для работы с DOM
 */
function addCellStatusClasses(
  cell: Element,
  countIssues: number,
  wipLimit: number,
  pageObject: IWipLimitCellsBoardPageObject
): void {
  if (countIssues > wipLimit) {
    pageObject.setCellBackgroundColor(cell, '#ff563070');
    pageObject.addCellClass(cell, 'WipLimit_NotRespected');
  } else {
    pageObject.addCellClass(cell, 'WipLimit_Respected');
  }
}

/**
 * Рендерит WIP лимиты на ячейках доски.
 *
 * Для каждого диапазона (range):
 * 1. Находит все ячейки диапазона на доске
 * 2. Подсчитывает количество issues в ячейках
 * 3. Вычисляет границы диапазона для визуализации
 * 4. Применяет стили и badge к ячейкам
 *
 * @param ranges - массив диапазонов WIP лимитов
 * @param shouldCountIssue - функция для фильтрации issues по типу
 */
export const renderWipLimitCells = createAction({
  name: 'renderWipLimitCells',
  handler(ranges: WipLimitRange[], shouldCountIssue: ShouldCountIssueFn): void {
    const pageObject = this.di.inject(wipLimitCellsBoardPageObjectToken);
    const { cssSelectorOfIssues } = useWipLimitCellsRuntimeStore.getState();
    const allCells = pageObject.getAllCells();
    const emptyMatrix = getEmptyMatrix(allCells.length, allCells[0]?.length || 0);

    for (const range of ranges) {
      let countIssues = 0;
      const matrixRange = cloneMatrix(emptyMatrix);
      const cellsRuntime: WipLimitCellRuntime[] = [];

      // Находим все ячейки диапазона и подсчитываем issues
      for (const cell of range.cells) {
        const cellDOM = pageObject.getCellElement(cell.swimlane, cell.column);
        const cellRuntime: WipLimitCellRuntime = { ...cell };

        if (!cellDOM) {
          cellRuntime.notFoundOnBoard = true;
          cellsRuntime.push(cellRuntime);
          continue;
        }

        cellRuntime.DOM = cellDOM;
        const issues = pageObject.getIssuesInCell(cellDOM, cssSelectorOfIssues);
        const filteredIssues =
          range.includedIssueTypes && range.includedIssueTypes.length > 0
            ? issues.filter(issue => shouldCountIssue(issue, range.includedIssueTypes))
            : issues;

        countIssues += filteredIssues.length;

        // Находим координаты ячейки в матрице
        const coordinates = findCellCoordinates(allCells, matrixRange, cellDOM);
        cellRuntime.x = coordinates.row;
        cellRuntime.y = coordinates.col;

        cellsRuntime.push(cellRuntime);
      }

      // Инвертируем матрицу для вычисления границ
      // invertMatrix возвращает матрицу, где 1 заменены на [Element], 0 остаются 0
      const invertedMatrix = invertMatrix(allCells, matrixRange);
      // Преобразуем в матрицу 0/1 для calculateBorders (0 если пусто, 1 если есть элемент)
      const borderMatrix = invertedMatrix.map(row => row.map(cell => (Array.isArray(cell) ? 1 : 0)));

      // Вычисляем цвет badge
      const badgeColor = getBadgeColor(countIssues, range.wipLimit);

      // Применяем стили и badge к ячейкам
      for (const cellRuntime of cellsRuntime) {
        if (cellRuntime.notFoundOnBoard || !cellRuntime.DOM) {
          continue;
        }

        const cellDOM = cellRuntime.DOM;

        // Добавляем класс disable если нужно
        if (range.disable) {
          pageObject.addCellClass(cellDOM, 'WipLimitCells_disable');
        }

        // Вычисляем границы ячейки
        if (cellRuntime.x !== undefined && cellRuntime.y !== undefined) {
          cellRuntime.border = calculateBorders(cellRuntime.x, cellRuntime.y, borderMatrix);
          addCellBorderClasses(cellDOM, cellRuntime.border, pageObject);
        }

        // Добавляем классы статуса лимита
        addCellStatusClasses(cellDOM, countIssues, range.wipLimit, pageObject);

        // Вставляем badge если нужно (не показываем для disabled range)
        if (cellRuntime.showBadge && !range.disable) {
          const badgeHtml = getBadgeHtml(countIssues, range.wipLimit, badgeColor);
          pageObject.insertBadge(cellDOM, badgeHtml);
        }
      }
    }
  },
});
