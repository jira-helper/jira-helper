import { describe, it, expect } from 'vitest';
import { isPersonsIssue } from './isPersonsIssue';

describe('isPersonsIssue', () => {
  it('should return true when assignee matches any person in array', () => {
    const stats = {
      persons: [{ name: 'alice' }, { name: 'bob' }],
    };
    expect(isPersonsIssue(stats, 'alice')).toBe(true);
    expect(isPersonsIssue(stats, 'bob')).toBe(true);
  });

  it('should return true when assignee matches displayName', () => {
    const stats = {
      persons: [{ name: 'alice', displayName: 'Alice Smith' }],
    };
    expect(isPersonsIssue(stats, 'Alice Smith')).toBe(true);
  });

  it('should return false when assignee does not match any person', () => {
    const stats = {
      persons: [{ name: 'alice' }],
    };
    expect(isPersonsIssue(stats, 'charlie')).toBe(false);
  });
});
