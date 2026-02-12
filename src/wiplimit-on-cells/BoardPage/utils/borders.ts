/**
 * Вычисляет строку границ для ячейки в матрице.
 * Возвращает строку из букв T/B/L/R (top/bottom/left/right),
 * указывающую, какие границы нужно рисовать для ячейки.
 *
 * Логика:
 * - Граница добавляется, если соседняя ячейка равна 0 или находится на краю матрицы
 * - T (top) - верхняя граница
 * - B (bottom) - нижняя граница
 * - L (left) - левая граница
 * - R (right) - правая граница
 *
 * @param row - индекс строки ячейки (0-based)
 * @param col - индекс столбца ячейки (0-based)
 * @param matrix - матрица, где 1 означает помеченную ячейку, 0 - пустую
 * @returns строка с буквами границ (например, "TBLR", "TB", "LR", "")
 *
 * @example
 * const matrix = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
 * calculateBorders(1, 1, matrix); // "TBLR" - все границы
 *
 * @example
 * const matrix = [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
 * calculateBorders(1, 1, matrix); // "" - нет границ (окружена)
 */
export function calculateBorders(row: number, col: number, matrix: number[][]): string {
  let borderString = '';

  // Top border
  if (row !== 0) {
    if (matrix[row - 1][col] === 0) {
      borderString += 'T';
    }
  } else {
    borderString += 'T';
  }

  // Bottom border
  if (row !== matrix.length - 1) {
    if (matrix[row + 1][col] === 0) {
      borderString += 'B';
    }
  } else {
    borderString += 'B';
  }

  // Left border
  if (col !== 0) {
    if (matrix[row][col - 1] === 0) {
      borderString += 'L';
    }
  } else {
    borderString += 'L';
  }

  // Right border
  if (col !== matrix[row].length - 1) {
    if (matrix[row][col + 1] === 0) {
      borderString += 'R';
    }
  } else {
    borderString += 'R';
  }

  return borderString;
}
