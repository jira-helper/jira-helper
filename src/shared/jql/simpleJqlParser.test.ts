import { describe, it, expect } from 'vitest';
import { formatJqlConditionLabel, parseJql, parseJqlAst } from './simpleJqlParser';

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
    expect(parseJql('FIELD1 in (a, b, c,)')(wrap({ field1: 'c' }))).toBe(true);
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
    expect(parseJql('labels in (foo, bar, bad, got)')(wrap({ labels: ['feature', 'bug', 'urgent'] }))).toBe(false);
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

  it('incorrect JQL should throw', () => {
    expect(() => parseJql('Field1 = value with spaces')(wrap({}))).toThrow(
      'Expected AND, OR, "," or ) expected, but got "with". Did you forget to quote the value?'
    );
    expect(() => parseJql('Field1 with1 spaces = value with spaces')(wrap({}))).toThrow(
      'Unknown operator: "with1". Did you forget to quote the field name?'
    );
    expect(() => parseJql('Field1 not in a')(wrap({}))).toThrow('Expected ( after in');
  });
  it('complex cases', () => {
    expect(
      parseJql(
        'project = THF and labels in (without-idea) and Team = Hotels.Core and Team != Hotels.B2C.Orders and component not in (HotelsApi)'
      )(
        wrap({
          project: 'THF',
          labels: ['without-idea'],
          team: 'Hotels.Core',
          component: ['HotelsWeb'],
        })
      )
    ).toEqual(true);
  });

  it('should match ~ (contains) and !~ (not contains) for strings, numbers, arrays, null, undefined, boolean', () => {
    // String
    expect(parseJql('Field1 ~ val')(wrap({ Field1: 'value' }))).toBe(true);
    expect(parseJql('Field1 ~ val')(wrap({ Field1: 'other' }))).toBe(false);
    expect(parseJql('Field1 !~ val')(wrap({ Field1: 'value' }))).toBe(false);
    expect(parseJql('Field1 !~ val')(wrap({ Field1: 'other' }))).toBe(true);
    // Quoted string
    expect(parseJql('Field1 ~ "hello world"')(wrap({ Field1: 'say hello world!' }))).toBe(true);
    expect(parseJql('Field1 !~ "hello world"')(wrap({ Field1: 'say hello world!' }))).toBe(false);
    // Number
    expect(parseJql('Field1 ~ 23')(wrap({ Field1: 12345 }))).toBe(true);
    expect(parseJql('Field1 !~ 23')(wrap({ Field1: 12345 }))).toBe(false);
    expect(parseJql('Field1 ~ 99')(wrap({ Field1: 12345 }))).toBe(false);
    expect(parseJql('Field1 !~ 99')(wrap({ Field1: 12345 }))).toBe(true);
    // Array of strings
    expect(parseJql('Field1 ~ foo')(wrap({ Field1: ['bar', 'foo', 'baz'] }))).toBe(true);
    expect(parseJql('Field1 !~ foo')(wrap({ Field1: ['bar', 'foo', 'baz'] }))).toBe(false);
    expect(parseJql('Field1 ~ qux')(wrap({ Field1: ['bar', 'foo', 'baz'] }))).toBe(false);
    expect(parseJql('Field1 !~ qux')(wrap({ Field1: ['bar', 'foo', 'baz'] }))).toBe(true);
    // Array of numbers
    expect(parseJql('Field1 ~ 23')(wrap({ Field1: [1, 23, 456] }))).toBe(true);
    expect(parseJql('Field1 !~ 23')(wrap({ Field1: [1, 23, 456] }))).toBe(false);
    expect(parseJql('Field1 ~ 99')(wrap({ Field1: [1, 23, 456] }))).toBe(false);
    expect(parseJql('Field1 !~ 99')(wrap({ Field1: [1, 23, 456] }))).toBe(true);
    // Null/undefined/boolean
    expect(parseJql('Field1 ~ foo')(wrap({ Field1: null }))).toBe(false);
    expect(parseJql('Field1 !~ foo')(wrap({ Field1: null }))).toBe(true);
    expect(parseJql('Field1 ~ foo')(wrap({ Field1: undefined }))).toBe(false);
    expect(parseJql('Field1 !~ foo')(wrap({ Field1: undefined }))).toBe(true);
    expect(parseJql('Field1 ~ foo')(wrap({ Field1: true }))).toBe(false);
    expect(parseJql('Field1 !~ foo')(wrap({ Field1: false }))).toBe(true);
    // Case-insensitive field name
    expect(parseJql('FIELD1 ~ foo')(wrap({ field1: 'foobar' }))).toBe(true);
    expect(parseJql('field1 !~ foo')(wrap({ FIELD1: 'foobar' }))).toBe(false);
  });
  it('should parse jql (found errors in prod)', () => {
    expect(() => parseJql('project = THF or Platform')(wrap({}))).toThrow('Expecting operator, but got END');
    expect(() => parseJql('project = THF or Platform = ')(wrap({}))).toThrow('Expecting value, but got END');
  });

  // Real Jira accepts JQL without spaces around comparison operators (e.g. `project=TRPA`).
  // The previous tokenizer treated `project=TRPA` as a single identifier, which then collided
  // with the next `AND` and produced `Unknown operator: "AND"`. See user feedback for TASK-44.
  it('parses operators without surrounding whitespace', () => {
    expect(parseJql('Field1=value')(wrap({ Field1: 'value' }))).toBe(true);
    expect(parseJql('Field1=value')(wrap({ Field1: 'other' }))).toBe(false);
    expect(parseJql('Field1!=value')(wrap({ Field1: 'value' }))).toBe(false);
    expect(parseJql('Field1!=value')(wrap({ Field1: 'other' }))).toBe(true);
    expect(parseJql('project=TRPA AND status=Done')(wrap({ project: 'TRPA', status: 'Done' }))).toBe(true);
    expect(parseJql('project=TRPA AND status=Done')(wrap({ project: 'TRPA', status: 'Open' }))).toBe(false);
    // Mixed spacing
    expect(parseJql('a =1 AND b= 2')(wrap({ a: '1', b: '2' }))).toBe(true);
    // ~ and !~ also collapse
    expect(parseJql('summary~win')(wrap({ summary: 'winter' }))).toBe(true);
    expect(parseJql('summary!~win')(wrap({ summary: 'summer' }))).toBe(true);
  });

  describe('case-insensitive equality and membership', () => {
    it('matches = / != / in / not in ignoring case', () => {
      expect(parseJql('status = developing')(wrap({ status: 'Developing' }))).toBe(true);
      expect(parseJql('status = Developing')(wrap({ status: 'developing' }))).toBe(true);
      expect(parseJql('status != developing')(wrap({ status: 'Developing' }))).toBe(false);
      expect(parseJql('status in ("To Do", developing)')(wrap({ status: 'Developing' }))).toBe(true);
      expect(parseJql('status not in (developing)')(wrap({ status: 'Developing' }))).toBe(false);
      expect(parseJql('status not in (done)')(wrap({ status: 'Developing' }))).toBe(true);
    });
  });

  it('formats condition labels with function RHS for debug UI', () => {
    const ast = parseJqlAst('"End date" < now()');
    expect(ast.type).toBe('condition');
    if (ast.type === 'condition') {
      expect(formatJqlConditionLabel(ast)).toBe('end date < now()');
    }
    expect(
      formatJqlConditionLabel({
        field: 'duedate',
        op: '>=',
        fn: { name: 'startofday', args: ['-1d'] },
      })
    ).toBe('duedate >= startofday(-1d)');
  });

  describe('comparison operators < > <= >=', () => {
    it('compares numbers', () => {
      expect(parseJql('"Story Points" > 13')(wrap({ 'story points': '14' }))).toBe(true);
      expect(parseJql('"Story Points" > 13')(wrap({ 'story points': '13' }))).toBe(false);
      expect(parseJql('"Story Points" >= 13')(wrap({ 'story points': '13' }))).toBe(true);
      expect(parseJql('"Story Points" < 5')(wrap({ 'story points': '3' }))).toBe(true);
      expect(parseJql('"Story Points" <= 5')(wrap({ 'story points': '5' }))).toBe(true);
      expect(parseJql('"Story Points" <= 5')(wrap({ 'story points': '6' }))).toBe(false);
    });

    it('compares date literals (YYYY-MM-DD)', () => {
      expect(parseJql('duedate < 2020-06-01')(wrap({ duedate: '2020-05-01' }))).toBe(true);
      expect(parseJql('duedate < 2020-06-01')(wrap({ duedate: '2020-07-01' }))).toBe(false);
      expect(parseJql('duedate >= "2020-06-01"')(wrap({ duedate: '2020-06-01' }))).toBe(true);
      expect(parseJql('duedate > "2020-06-01"')(wrap({ duedate: '2020-06-01' }))).toBe(false);
    });

    it('does not match when field is empty', () => {
      expect(parseJql('duedate < 2020-06-01')(wrap({ duedate: undefined }))).toBe(false);
      expect(parseJql('duedate < 2020-06-01')(wrap({ duedate: null }))).toBe(false);
      expect(parseJql('duedate < 2020-06-01')(wrap({ duedate: [] }))).toBe(false);
    });

    it('parses comparison ops without surrounding whitespace', () => {
      expect(parseJql('points>10')(wrap({ points: '11' }))).toBe(true);
      expect(parseJql('points<=10')(wrap({ points: '10' }))).toBe(true);
      expect(parseJql('duedate<"2020-06-01"')(wrap({ duedate: '2020-05-01' }))).toBe(true);
    });
  });

  describe('date functions', () => {
    const fixedNow = new Date('2026-08-10T15:30:00.000Z');
    const opts = { now: () => fixedNow };

    it('supports now()', () => {
      expect(parseJql('duedate < now()', opts)(wrap({ duedate: '2026-08-09' }))).toBe(true);
      // Far-future date-only so local-midnight parsing stays after fixedNow in any TZ
      expect(parseJql('duedate < now()', opts)(wrap({ duedate: '2026-08-20' }))).toBe(false);
      expect(parseJql('created > now()', opts)(wrap({ created: '2026-08-10T16:00:00.000Z' }))).toBe(true);
      expect(parseJql('created > now()', opts)(wrap({ created: '2026-08-10T14:00:00.000Z' }))).toBe(false);
    });

    it('supports startOfDay / endOfDay with optional increment', () => {
      // date-only fields use local calendar day — safe across TZ when far from boundary
      expect(parseJql('duedate < startOfDay()', opts)(wrap({ duedate: '2026-08-09' }))).toBe(true);
      expect(parseJql('duedate >= startOfDay()', opts)(wrap({ duedate: '2026-08-10' }))).toBe(true);
      expect(parseJql('duedate < startOfDay("-1d")', opts)(wrap({ duedate: '2026-08-08' }))).toBe(true);
      expect(parseJql('duedate < startOfDay(-1d)', opts)(wrap({ duedate: '2026-08-08' }))).toBe(true);
      expect(parseJql('duedate <= endOfDay()', opts)(wrap({ duedate: '2026-08-10' }))).toBe(true);
      expect(parseJql('duedate > endOfDay()', opts)(wrap({ duedate: '2026-08-11' }))).toBe(true);
    });

    it('supports startOfWeek/Month/Year and endOfWeek/Month/Year', () => {
      // 2026-08-10 is a Monday — ISO week start (Monday)
      expect(parseJql('duedate >= startOfWeek()', opts)(wrap({ duedate: '2026-08-10' }))).toBe(true);
      expect(parseJql('duedate < startOfWeek()', opts)(wrap({ duedate: '2026-08-09' }))).toBe(true);
      expect(parseJql('duedate <= endOfWeek()', opts)(wrap({ duedate: '2026-08-16' }))).toBe(true);
      expect(parseJql('duedate > endOfWeek()', opts)(wrap({ duedate: '2026-08-17' }))).toBe(true);
      expect(parseJql('duedate >= startOfMonth()', opts)(wrap({ duedate: '2026-08-01' }))).toBe(true);
      expect(parseJql('duedate < startOfMonth()', opts)(wrap({ duedate: '2026-07-31' }))).toBe(true);
      expect(parseJql('duedate >= startOfYear()', opts)(wrap({ duedate: '2026-01-01' }))).toBe(true);
      expect(parseJql('duedate < startOfYear()', opts)(wrap({ duedate: '2025-12-31' }))).toBe(true);
      expect(parseJql('duedate <= endOfMonth()', opts)(wrap({ duedate: '2026-08-31' }))).toBe(true);
      expect(parseJql('duedate > endOfMonth()', opts)(wrap({ duedate: '2026-09-01' }))).toBe(true);
      expect(parseJql('duedate <= endOfYear()', opts)(wrap({ duedate: '2026-12-31' }))).toBe(true);
    });

    it('throws on unknown function', () => {
      expect(() => parseJql('assignee = currentUser()')).toThrow(/Unsupported function/i);
      expect(() => parseJql('duedate < foo()')).toThrow(/Unsupported function/i);
    });
  });

  it('matches epic overdue / missing end-date style query', () => {
    const opts = { now: () => new Date('2026-08-10T12:00:00.000Z') };
    const jql =
      'issueType = Epic and status in ("To Do", developing, "Technical Specification", "Ready to Develop", "ready to release") and ("End date" is EMPTY OR "End date" < now())';

    const match = parseJql(jql, opts);

    expect(
      match(
        wrap({
          issuetype: 'Epic',
          status: 'Developing', // case differs from JQL token `developing`
          'end date': undefined,
        })
      )
    ).toBe(true);

    expect(
      match(
        wrap({
          issuetype: 'Epic',
          status: 'Ready to Develop',
          'end date': '2026-08-01',
        })
      )
    ).toBe(true);

    expect(
      match(
        wrap({
          issuetype: 'Epic',
          status: 'Ready to Develop',
          'end date': '2026-08-20',
        })
      )
    ).toBe(false);

    expect(
      match(
        wrap({
          issuetype: 'Story',
          status: 'developing',
          'end date': undefined,
        })
      )
    ).toBe(false);
  });
});
