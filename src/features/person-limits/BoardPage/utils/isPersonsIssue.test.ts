import { describe, it, expect } from 'vitest';
import { isPersonsIssue } from './isPersonsIssue';

describe('isPersonsIssue', () => {
  it('should return true when assignee matches person name', () => {
    const person = { person: { name: 'john.doe' } };
    expect(isPersonsIssue(person, 'john.doe')).toBe(true);
  });

  it('should return true when assignee matches displayName', () => {
    const person = { person: { name: 'john.doe', displayName: 'John Doe' } };
    expect(isPersonsIssue(person, 'John Doe')).toBe(true);
  });

  it('should return false when assignee does not match', () => {
    const person = { person: { name: 'john.doe', displayName: 'John Doe' } };
    expect(isPersonsIssue(person, 'Jane Doe')).toBe(false);
  });

  it('should return false when assignee is null', () => {
    const person = { person: { name: 'john.doe' } };
    expect(isPersonsIssue(person, null)).toBe(false);
  });

  it('should not match displayName when it is undefined', () => {
    const person = { person: { name: 'john.doe' } };
    expect(isPersonsIssue(person, 'John Doe')).toBe(false);
  });
});
