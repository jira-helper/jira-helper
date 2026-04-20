import { describe, it, expect } from 'vitest';
import { parseChangelog } from './parseChangelog';

describe('parseChangelog', () => {
  it('returns empty array for undefined changelog', () => {
    expect(parseChangelog(undefined)).toEqual([]);
  });

  it('returns empty array for null changelog', () => {
    expect(parseChangelog(null)).toEqual([]);
  });

  it('returns empty array when histories is missing or empty', () => {
    expect(parseChangelog({})).toEqual([]);
    expect(parseChangelog({ histories: [] })).toEqual([]);
  });

  it('parses a single status transition', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            {
              field: 'status',
              fromString: 'To Do',
              toString: 'In Progress',
              from: '10000',
              to: '10001',
            },
          ],
        },
      ],
    };

    expect(parseChangelog(changelog)).toEqual([
      {
        timestamp: new Date('2024-01-15T09:00:00.000Z'),
        fromStatus: 'To Do',
        toStatus: 'In Progress',
        fromCategory: '',
        toCategory: '',
      },
    ]);
  });

  it('collects multiple transitions and sorts oldest first', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-20T10:00:00.000+0000',
          items: [{ field: 'status', fromString: 'In Progress', toString: 'Done' }],
        },
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
        },
      ],
    };

    const result = parseChangelog(changelog);

    expect(result).toHaveLength(2);
    expect(result[0].timestamp).toEqual(new Date('2024-01-15T09:00:00.000Z'));
    expect(result[0].fromStatus).toBe('To Do');
    expect(result[1].timestamp).toEqual(new Date('2024-01-20T10:00:00.000Z'));
    expect(result[1].toStatus).toBe('Done');
  });

  it('filters out non-status changelog items', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            { field: 'assignee', fromString: 'a', toString: 'b' },
            { field: 'status', fromString: 'Open', toString: 'Closed' },
            { field: 'priority', fromString: 'Low', toString: 'High' },
          ],
        },
      ],
    };

    expect(parseChangelog(changelog)).toEqual([
      {
        timestamp: new Date('2024-01-15T09:00:00.000Z'),
        fromStatus: 'Open',
        toStatus: 'Closed',
        fromCategory: '',
        toCategory: '',
      },
    ]);
  });

  it('maps categories from status color via mapStatusCategoryColorToProgressStatus', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            {
              field: 'status',
              fromString: 'A',
              toString: 'B',
              fromStatusCategory: { colorName: 'blue-gray' },
              toStatusCategory: { colorName: 'yellow' },
            },
          ],
        },
      ],
    };

    expect(parseChangelog(changelog)).toEqual([
      {
        timestamp: new Date('2024-01-15T09:00:00.000Z'),
        fromStatus: 'A',
        toStatus: 'B',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      },
    ]);
  });

  it('falls back to status category key when color does not map', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            {
              field: 'status',
              fromString: 'A',
              toString: 'B',
              fromStatusCategory: { key: 'new', colorName: 'medium-gray' },
              toStatusCategory: { key: 'indeterminate', colorName: 'brown' },
            },
          ],
        },
      ],
    };

    expect(parseChangelog(changelog)).toEqual([
      {
        timestamp: new Date('2024-01-15T09:00:00.000Z'),
        fromStatus: 'A',
        toStatus: 'B',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      },
    ]);
  });

  it('uses key mapping when category metadata has no colorName', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            {
              field: 'status',
              fromString: 'A',
              toString: 'B',
              toStatusCategory: { key: 'done' },
            },
          ],
        },
      ],
    };

    expect(parseChangelog(changelog)[0].toCategory).toBe('done');
  });

  it('skips histories with invalid or missing created timestamp', () => {
    const changelog = {
      histories: [
        { created: 'not-a-date', items: [{ field: 'status', fromString: 'A', toString: 'B' }] },
        { items: [{ field: 'status', fromString: 'X', toString: 'Y' }] },
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [{ field: 'status', fromString: 'OK', toString: 'OK2' }],
        },
      ],
    };

    expect(parseChangelog(changelog)).toHaveLength(1);
    expect(parseChangelog(changelog)[0].fromStatus).toBe('OK');
  });

  it('expands multiple status items in the same history with the same timestamp', () => {
    const changelog = {
      histories: [
        {
          created: '2024-01-15T09:00:00.000+0000',
          items: [
            { field: 'status', fromString: 'A', toString: 'B' },
            { field: 'status', fromString: 'B', toString: 'C' },
          ],
        },
      ],
    };

    const result = parseChangelog(changelog);
    expect(result).toHaveLength(2);
    expect(result[0].toStatus).toBe('B');
    expect(result[1].fromStatus).toBe('B');
    expect(result[0].timestamp).toEqual(result[1].timestamp);
  });
});
