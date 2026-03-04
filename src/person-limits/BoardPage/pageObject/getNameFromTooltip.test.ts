import { describe, it, expect } from 'vitest';
import { getNameFromTooltip } from './PersonLimitsBoardPageObject';

describe('getNameFromTooltip', () => {
  it('should extract name from standard tooltip format', () => {
    expect(getNameFromTooltip('Assignee: Pavel')).toBe('Pavel');
  });

  it('should remove [x] suffix for inactive users', () => {
    expect(getNameFromTooltip('Assignee: Pavel [x]')).toBe('Pavel');
  });

  it('should handle name without colon', () => {
    expect(getNameFromTooltip('Pavel')).toBe('Pavel');
  });

  it('should trim whitespace', () => {
    expect(getNameFromTooltip('Assignee:  Pavel  ')).toBe('Pavel');
  });

  it('should preserve brackets in username like [В]', () => {
    expect(getNameFromTooltip('Assignee: Иван [В]')).toBe('Иван [В]');
  });

  it('should preserve brackets in username and remove [x] suffix', () => {
    expect(getNameFromTooltip('Assignee: Иван [В] [x]')).toBe('Иван [В]');
  });

  it('should handle multiple brackets in name', () => {
    expect(getNameFromTooltip('Assignee: Test [A] [B]')).toBe('Test [A] [B]');
  });

  it('should handle multiple brackets in name with [x] suffix', () => {
    expect(getNameFromTooltip('Assignee: Test [A] [B] [x]')).toBe('Test [A] [B]');
  });

  it('should return empty string if name is just [x] marker', () => {
    // Edge case: if tooltip is just "[x]" after label, name is effectively empty
    expect(getNameFromTooltip('Assignee: [x]')).toBe('');
  });

  it('should preserve [x] in middle of name', () => {
    expect(getNameFromTooltip('Assignee: Test [x] User')).toBe('Test [x] User');
  });

  it('should handle empty string after colon', () => {
    expect(getNameFromTooltip('Assignee:')).toBe('');
  });
});
