import { describe, it, expect } from 'vitest';
import { getEmptyMatrix, cloneMatrix, markCellInMatrix } from './matrix';

describe('matrix utils', () => {
  describe('getEmptyMatrix', () => {
    it('should create a matrix of zeros with specified dimensions', () => {
      // Arrange
      const rows = 3;
      const cols = 4;

      // Act
      const result = getEmptyMatrix(rows, cols);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(4);
      expect(result[1]).toHaveLength(4);
      expect(result[2]).toHaveLength(4);
      expect(result.flat()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should create an empty matrix for zero rows', () => {
      // Arrange
      const rows = 0;
      const cols = 5;

      // Act
      const result = getEmptyMatrix(rows, cols);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should create a matrix with zero columns', () => {
      // Arrange
      const rows = 2;
      const cols = 0;

      // Act
      const result = getEmptyMatrix(rows, cols);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(0);
      expect(result[1]).toHaveLength(0);
    });
  });

  describe('cloneMatrix', () => {
    it('should create a deep copy of a 2D array', () => {
      // Arrange
      const original = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      // Act
      const cloned = cloneMatrix(original);
      cloned[0][0] = 999;

      // Assert
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
      expect(original[0][0]).toBe(1);
      expect(cloned[0][0]).toBe(999);
    });

    it('should clone an empty matrix', () => {
      // Arrange
      const original: number[][] = [];

      // Act
      const cloned = cloneMatrix(original);

      // Assert
      expect(cloned).toEqual([]);
      expect(cloned).not.toBe(original);
    });

    it('should clone a matrix with different row lengths', () => {
      // Arrange
      const original = [[1, 2], [3, 4, 5], [6]];

      // Act
      const cloned = cloneMatrix(original);
      cloned[1][2] = 999;

      // Assert
      expect(cloned).not.toBe(original);
      expect(original[1][2]).toBe(5);
      expect(cloned[1][2]).toBe(999);
    });

    it('should clone a matrix with nested arrays', () => {
      // Arrange
      const original = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];

      // Act
      const cloned = cloneMatrix(original);
      cloned[0][0][0] = 999;

      // Assert
      expect(cloned).not.toBe(original);
      expect(original[0][0][0]).toBe(1);
      expect(cloned[0][0][0]).toBe(999);
    });
  });

  describe('markCellInMatrix', () => {
    it('should mark a cell with 1 at specified position', () => {
      // Arrange
      const matrix = getEmptyMatrix(3, 4);
      const row = 1;
      const col = 2;

      // Act
      markCellInMatrix(row, col, matrix);

      // Assert
      expect(matrix[row][col]).toBe(1);
      expect(matrix[0][0]).toBe(0);
      expect(matrix[0][1]).toBe(0);
      expect(matrix[2][3]).toBe(0);
    });

    it('should mark multiple cells independently', () => {
      // Arrange
      const matrix = getEmptyMatrix(2, 2);

      // Act
      markCellInMatrix(0, 0, matrix);
      markCellInMatrix(0, 1, matrix);
      markCellInMatrix(1, 0, matrix);
      markCellInMatrix(1, 1, matrix);

      // Assert
      expect(matrix[0][0]).toBe(1);
      expect(matrix[0][1]).toBe(1);
      expect(matrix[1][0]).toBe(1);
      expect(matrix[1][1]).toBe(1);
    });

    it('should mark a cell at the edge of the matrix', () => {
      // Arrange
      const matrix = getEmptyMatrix(3, 3);
      const row = 0;
      const col = 0;

      // Act
      markCellInMatrix(row, col, matrix);

      // Assert
      expect(matrix[row][col]).toBe(1);
    });

    it('should mark a cell at the last position', () => {
      // Arrange
      const matrix = getEmptyMatrix(3, 3);
      const row = 2;
      const col = 2;

      // Act
      markCellInMatrix(row, col, matrix);

      // Assert
      expect(matrix[row][col]).toBe(1);
    });
  });
});
