import { describe, it, expect } from 'vitest';
import { calculateBorders } from './borders';
import { getEmptyMatrix, markCellInMatrix } from './matrix';

describe('calculateBorders', () => {
  it('should return all borders for a single isolated cell', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 1, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBLR');
  });

  it('should return top and left borders for top-left corner cell', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(0, 0, matrix);
    const row = 0;
    const col = 0;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBLR');
  });

  it('should return bottom and right borders for bottom-right corner cell', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(2, 2, matrix);
    const row = 2;
    const col = 2;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBLR');
  });

  it('should exclude top border if cell above is marked', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(0, 1, matrix);
    markCellInMatrix(1, 1, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('BLR');
  });

  it('should exclude bottom border if cell below is marked', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 1, matrix);
    markCellInMatrix(2, 1, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TLR');
  });

  it('should exclude left border if cell to the left is marked', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 0, matrix);
    markCellInMatrix(1, 1, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBR');
  });

  it('should exclude right border if cell to the right is marked', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 1, matrix);
    markCellInMatrix(1, 2, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBL');
  });

  it('should exclude multiple borders when surrounded by marked cells', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(0, 1, matrix); // top
    markCellInMatrix(1, 0, matrix); // left
    markCellInMatrix(1, 1, matrix); // center
    markCellInMatrix(1, 2, matrix); // right
    markCellInMatrix(2, 1, matrix); // bottom
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('');
  });

  it('should handle a horizontal line of cells', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 0, matrix);
    markCellInMatrix(1, 1, matrix);
    markCellInMatrix(1, 2, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TB');
  });

  it('should handle a vertical line of cells', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(0, 1, matrix);
    markCellInMatrix(1, 1, matrix);
    markCellInMatrix(2, 1, matrix);
    const row = 1;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('LR');
  });

  it('should handle edge case: cell at top row', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(0, 1, matrix);
    const row = 0;
    const col = 1;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBLR');
  });

  it('should handle edge case: cell at leftmost column', () => {
    // Arrange
    const matrix = getEmptyMatrix(3, 3);
    markCellInMatrix(1, 0, matrix);
    const row = 1;
    const col = 0;

    // Act
    const result = calculateBorders(row, col, matrix);

    // Assert
    expect(result).toBe('TBLR');
  });
});
