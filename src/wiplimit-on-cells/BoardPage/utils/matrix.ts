/**
 * Создаёт матрицу нулей заданного размера.
 *
 * @param rows - количество строк
 * @param cols - количество столбцов
 * @returns матрица размером rows x cols, заполненная нулями
 *
 * @example
 * getEmptyMatrix(2, 3) // [[0, 0, 0], [0, 0, 0]]
 */
export function getEmptyMatrix(rows: number, cols: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(0);
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Выполняет глубокое клонирование 2D массива (или любого уровня вложенности).
 *
 * @param matrix - исходная матрица для клонирования
 * @returns новая матрица, независимая от исходной
 *
 * @example
 * const original = [[1, 2], [3, 4]];
 * const cloned = cloneMatrix(original);
 * cloned[0][0] = 999;
 * // original[0][0] остаётся 1
 */
export function cloneMatrix<T>(matrix: T[][]): T[][] {
  const copy: T[][] = [];
  for (let i = 0; i < matrix.length; i++) {
    if (Array.isArray(matrix[i])) {
      copy[i] = cloneMatrix(matrix[i] as T[][]) as T[];
    } else {
      copy[i] = matrix[i];
    }
  }
  return copy;
}

/**
 * Помечает ячейку в матрице значением 1.
 * Модифицирует исходную матрицу.
 *
 * @param row - индекс строки (0-based)
 * @param col - индекс столбца (0-based)
 * @param matrix - матрица для модификации
 *
 * @example
 * const matrix = getEmptyMatrix(3, 3);
 * markCellInMatrix(1, 2, matrix);
 * // matrix[1][2] === 1
 */
export function markCellInMatrix(row: number, col: number, matrix: number[][]): void {
  matrix[row][col] = 1;
}

/**
 * Находит координаты DOM-элемента в матрице ячеек и помечает его в матрице.
 *
 * @param cellsMatrix - матрица DOM-элементов ячеек [swimlane][column]
 * @param rangeMatrix - матрица диапазона для пометки (модифицируется)
 * @param cellDOM - DOM-элемент ячейки для поиска
 * @returns объект с координатами { row, col } или { row: 0, col: 0 } если не найдено
 *
 * @example
 * const cells = [[cell1, cell2], [cell3, cell4]];
 * const range = getEmptyMatrix(2, 2);
 * findCellCoordinates(cells, range, cell2);
 * // { row: 0, col: 1 }
 * // range[0][1] === 1
 */
export function findCellCoordinates(
  cellsMatrix: Element[][],
  rangeMatrix: number[][],
  cellDOM: Element
): { row: number; col: number } {
  const result = { row: 0, col: 0 };
  for (let row = 0; row < cellsMatrix.length; row++) {
    for (let col = 0; col < cellsMatrix[row].length; col++) {
      if (cellsMatrix[row][col] === cellDOM) {
        rangeMatrix[row][col] = 1;
        result.row = row;
        result.col = col;
        return result;
      }
    }
  }
  return result;
}

/**
 * Инвертирует матрицу диапазона: преобразует матрицу с 0/1 в матрицу с DOM-элементами.
 * Ячейки со значением 1 заменяются на массивы с соответствующими DOM-элементами из cellsMatrix.
 *
 * @param cellsMatrix - матрица DOM-элементов ячеек [swimlane][column]
 * @param rangeMatrix - матрица диапазона с 0/1 значениями
 * @returns новая матрица, где 1 заменены на массивы с DOM-элементами [Element], 0 остаются 0
 *
 * @example
 * const cells = [[cell1, cell2], [cell3, cell4]];
 * const range = [[0, 1], [1, 0]];
 * invertMatrix(cells, range);
 * // [[0, [cell2]], [[cell3], 0]]
 */
export function invertMatrix(cellsMatrix: Element[][], rangeMatrix: number[][]): any[][] {
  const emptyMatrix = getEmptyMatrix(rangeMatrix.length, rangeMatrix[0]?.length || 0);
  const result: any[][] = cloneMatrix(emptyMatrix);
  for (let row = 0; row < rangeMatrix.length; row++) {
    for (let col = 0; col < rangeMatrix[row].length; col++) {
      if (rangeMatrix[row][col] === 1) {
        result[row][col] = [cellsMatrix[row][col]];
      }
    }
  }
  return result;
}
