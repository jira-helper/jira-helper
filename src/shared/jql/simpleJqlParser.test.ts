import { describe, it, expect } from 'vitest';
import { parseJql } from './simpleJqlParser';

describe('simpleJqlParser', () => {
  // Case-insensitive getFieldValue
  const wrap = (fields: Record<string, any>) => (name: string) => {
    const key = Object.keys(fields).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? fields[key] : undefined;
  };

  it('should match basic equality', () => {
    expect(parseJql('Field1 = value')(wrap({ Field1: 'value' }))).toBe(true);
    expect(parseJql('Field1 = value')(wrap({ Field1: 'other' }))).toBe(false);
    // Case-insensitive field name
    expect(parseJql('FIELD1 = value')(wrap({ field1: 'value' }))).toBe(true);
    expect(parseJql('field1 = value')(wrap({ FIELD1: 'value' }))).toBe(true);
    expect(parseJql('field1 = value')(wrap({ FiElD1: 'value' }))).toBe(true);
    expect(parseJql('"Issue Size" = "Some Value"')(wrap({ 'issue size': 'Some Value' }))).toBe(true);
  });

  it('should match inequality', () => {
    expect(parseJql('Field1 != value')(wrap({ Field1: 'value' }))).toBe(false);
    expect(parseJql('Field1 != value')(wrap({ Field1: 'other' }))).toBe(true);
    expect(parseJql('FIELD1 != value')(wrap({ field1: 'other' }))).toBe(true);
  });

  it('should match IN and NOT IN', () => {
    expect(parseJql('Field1 in (a, b, c)')(wrap({ Field1: 'b' }))).toBe(true);
    expect(parseJql('Field1 in (a, b, c)')(wrap({ Field1: 'd' }))).toBe(false);
    expect(parseJql('Field1 not in (a, b, c)')(wrap({ Field1: 'b' }))).toBe(false);
    expect(parseJql('Field1 not in (a, b, c)')(wrap({ Field1: 'd' }))).toBe(true);
    expect(parseJql('FIELD1 in (a, b, c)')(wrap({ field1: 'b' }))).toBe(true);
  });

  it('should match AND and OR', () => {
    expect(parseJql('Field1 = a AND Field2 = b')(wrap({ Field1: 'a', Field2: 'b' }))).toBe(true);
    expect(parseJql('Field1 = a AND Field2 = b')(wrap({ Field1: 'a', Field2: 'c' }))).toBe(false);
    expect(parseJql('Field1 = a OR Field2 = b')(wrap({ Field1: 'a', Field2: 'c' }))).toBe(true);
    expect(parseJql('Field1 = a OR Field2 = b')(wrap({ Field1: 'x', Field2: 'b' }))).toBe(true);
    expect(parseJql('Field1 = a OR Field2 = b')(wrap({ Field1: 'x', Field2: 'y' }))).toBe(false);
    expect(parseJql('FIELD1 = a OR FIELD2 = b')(wrap({ field1: 'a', field2: 'b' }))).toBe(true);
  });

  it('should match parentheses', () => {
    expect(parseJql('(Field1 = a OR Field2 = b) AND Field2 != c')(wrap({ Field1: 'a', Field2: 'b' }))).toBe(true);
    expect(parseJql('(Field1 = a OR Field2 = b) AND Field2 != c')(wrap({ Field1: 'a', Field2: 'c' }))).toBe(false);
    expect(parseJql('(Field1 = a OR Field2 = b) AND Field2 not in (c, d)')(wrap({ Field1: 'a', Field2: 'b' }))).toBe(
      true
    );
    expect(parseJql('(Field1 = a OR Field2 = b) AND Field2 not in (c, d)')(wrap({ Field1: 'a', Field2: 'c' }))).toBe(
      false
    );
    expect(parseJql('(FIELD1 = a OR FIELD2 = b) AND FIELD2 != c')(wrap({ field1: 'a', field2: 'b' }))).toBe(true);
  });

  it('should match quoted values', () => {
    expect(parseJql('Field1 = "hello world"')(wrap({ Field1: 'hello world' }))).toBe(true);
    expect(parseJql('Field1 in ("a b", c)')(wrap({ Field1: 'a b' }))).toBe(true);
    expect(
      parseJql('Field1 = "accentapce bug" AND status != "done"')(wrap({ Field1: 'accentapce bug', status: 'open' }))
    ).toBe(true);
    expect(
      parseJql('Field1 = "accentapce bug" AND NOT status = "done"')(wrap({ Field1: 'accentapce bug', status: 'done' }))
    ).toBe(false);
    expect(parseJql('FIELD1 = "hello world"')(wrap({ field1: 'hello world' }))).toBe(true);
  });

  it('should match EMPTY and != EMPTY', () => {
    expect(parseJql('Field1 = EMPTY')(wrap({ Field1: undefined }))).toBe(true);
    expect(parseJql('Field1 = EMPTY')(wrap({ Field1: null }))).toBe(true);
    expect(parseJql('Field1 = EMPTY')(wrap({ Field1: '' }))).toBe(true);
    expect(parseJql('Field1 = EMPTY')(wrap({ Field1: [] }))).toBe(true);
    expect(parseJql('Field1 = EMPTY')(wrap({ Field1: 'not empty' }))).toBe(false);
    expect(parseJql('Field1 != EMPTY')(wrap({ Field1: 'not empty' }))).toBe(true);
    expect(parseJql('Field1 != EMPTY')(wrap({ Field1: undefined }))).toBe(false);
    expect(parseJql('Field1 != EMPTY')(wrap({ Field1: '' }))).toBe(false);
    expect(parseJql('FIELD1 = EMPTY')(wrap({ field1: undefined }))).toBe(true);
  });

  it('should match field is EMPTY', () => {
    expect(parseJql('Field1 is EMPTY')(wrap({ Field1: undefined }))).toBe(true);
    expect(parseJql('Field1 is EMPTY')(wrap({ Field1: 'not empty' }))).toBe(false);
    expect(parseJql('FIELD1 is EMPTY')(wrap({ field1: undefined }))).toBe(true);
  });

  it('should match if any value in array matches', () => {
    // =
    expect(parseJql('labels = bug')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(true);
    expect(parseJql('labels = bug')(wrap({ labels: ['feature', 'urgent'] }))).toBe(false);
    // !=
    expect(parseJql('labels != bug')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(false); // at least one is 'bug'
    expect(parseJql('labels != bug')(wrap({ labels: ['bug', 'bug'] }))).toBe(false); // all are 'bug'
    // in
    expect(parseJql('labels in (bug, urgent)')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(true);
    expect(parseJql('labels in (foo, bar)')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(false);
    // not in
    expect(parseJql('labels not in (foo, bar)')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(true);
    expect(parseJql('labels not in (bug, urgent)')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(false);
    // Case-insensitive field name
    expect(parseJql('LABELS = bug')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(true);
    expect(parseJql('labels = bug')(wrap({ LABELS: ['feature', 'bug', 'urgent'] }))).toBe(true);
  });

  it('should match is not empty', () => {
    expect(parseJql('project = "THF" AND  "Issue Size" is not EMPTY')(wrap({ project: 'THF', 'issue size': [] }))).toBe(
      false
    );
    expect(
      parseJql('project = "THF" AND  "Issue Size" is not EMPTY')(wrap({ project: 'THF', 'issue size': ['kek'] }))
    ).toBe(true);
  });
});
