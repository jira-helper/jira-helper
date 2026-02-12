import { describe, it, expect } from 'vitest';
import { getBadgeColor, getBadgeHtml } from './badge';

describe('badge utils', () => {
  describe('getBadgeColor', () => {
    it('should return green color when issueCount is less than wipLimit', () => {
      // Arrange
      const issueCount = 3;
      const wipLimit = 5;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#1b855c');
    });

    it('should return yellow color when issueCount equals wipLimit', () => {
      // Arrange
      const issueCount = 5;
      const wipLimit = 5;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#ffd700');
    });

    it('should return red color when issueCount is greater than wipLimit', () => {
      // Arrange
      const issueCount = 7;
      const wipLimit = 5;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#ff5630');
    });

    it('should return green color when issueCount is 0', () => {
      // Arrange
      const issueCount = 0;
      const wipLimit = 5;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#1b855c');
    });

    it('should return yellow color when both issueCount and wipLimit are 0', () => {
      // Arrange
      const issueCount = 0;
      const wipLimit = 0;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#ffd700');
    });

    it('should return red color for large difference', () => {
      // Arrange
      const issueCount = 100;
      const wipLimit = 5;

      // Act
      const result = getBadgeColor(issueCount, wipLimit);

      // Assert
      expect(result).toBe('#ff5630');
    });
  });

  describe('getBadgeHtml', () => {
    it('should generate HTML badge with default green color', () => {
      // Arrange
      const issueCount = 3;
      const wipLimit = 5;
      const color = '#1b855c';

      // Act
      const result = getBadgeHtml(issueCount, wipLimit, color);

      // Assert
      expect(result).toBe(
        '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #1b855c">3/5</div>'
      );
    });

    it('should generate HTML badge with yellow color', () => {
      // Arrange
      const issueCount = 5;
      const wipLimit = 5;
      const color = '#ffd700';

      // Act
      const result = getBadgeHtml(issueCount, wipLimit, color);

      // Assert
      expect(result).toBe(
        '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #ffd700">5/5</div>'
      );
    });

    it('should generate HTML badge with red color', () => {
      // Arrange
      const issueCount = 7;
      const wipLimit = 5;
      const color = '#ff5630';

      // Act
      const result = getBadgeHtml(issueCount, wipLimit, color);

      // Assert
      expect(result).toBe(
        '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #ff5630">7/5</div>'
      );
    });

    it('should handle zero values', () => {
      // Arrange
      const issueCount = 0;
      const wipLimit = 0;
      const color = '#ffd700';

      // Act
      const result = getBadgeHtml(issueCount, wipLimit, color);

      // Assert
      expect(result).toBe(
        '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #ffd700">0/0</div>'
      );
    });

    it('should handle large numbers', () => {
      // Arrange
      const issueCount = 100;
      const wipLimit = 50;
      const color = '#ff5630';

      // Act
      const result = getBadgeHtml(issueCount, wipLimit, color);

      // Assert
      expect(result).toBe(
        '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #ff5630">100/50</div>'
      );
    });
  });
});
