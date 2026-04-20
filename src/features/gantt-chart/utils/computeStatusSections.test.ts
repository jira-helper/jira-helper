import { describe, it, expect } from 'vitest';
import type { StatusTransition } from '../types';
import { computeStatusSections, mapCategoryStringToBarStatusCategory } from './computeStatusSections';

function transition(partial: Omit<StatusTransition, 'timestamp'> & { timestamp: string }): StatusTransition {
  return {
    ...partial,
    timestamp: new Date(partial.timestamp),
  };
}

describe('mapCategoryStringToBarStatusCategory', () => {
  it('maps empty string to todo (parseChangelog default side)', () => {
    expect(mapCategoryStringToBarStatusCategory('')).toBe('todo');
  });

  it('maps Jira category keys like parseChangelog mapStatusCategoryKeyToProgress', () => {
    expect(mapCategoryStringToBarStatusCategory('new')).toBe('todo');
    expect(mapCategoryStringToBarStatusCategory('indeterminate')).toBe('inProgress');
    expect(mapCategoryStringToBarStatusCategory('done')).toBe('done');
  });

  it('passes through normalized progress category strings', () => {
    expect(mapCategoryStringToBarStatusCategory('todo')).toBe('todo');
    expect(mapCategoryStringToBarStatusCategory('inProgress')).toBe('inProgress');
    expect(mapCategoryStringToBarStatusCategory('blocked')).toBe('blocked');
  });

  it('trims whitespace and falls back to todo for unknown values', () => {
    expect(mapCategoryStringToBarStatusCategory('  todo ')).toBe('todo');
    expect(mapCategoryStringToBarStatusCategory('unknown')).toBe('todo');
  });
});

describe('computeStatusSections', () => {
  const barStart = new Date('2024-06-01T00:00:00.000Z');
  const barEnd = new Date('2024-06-10T00:00:00.000Z');

  it('returns a single todo section when transitions are empty', () => {
    const sections = computeStatusSections([], barStart, barEnd);
    expect(sections).toEqual([
      {
        statusName: '',
        category: 'todo',
        startDate: barStart,
        endDate: barEnd,
      },
    ]);
  });

  it('splits on one transition inside the bar (from → to)', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-06-05T12:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'In Progress',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      statusName: 'Open',
      category: 'todo',
      startDate: barStart,
      endDate: new Date('2024-06-05T12:00:00.000Z'),
    });
    expect(sections[1]).toMatchObject({
      statusName: 'In Progress',
      category: 'inProgress',
      startDate: new Date('2024-06-05T12:00:00.000Z'),
      endDate: barEnd,
    });
  });

  it('handles multiple transitions in order', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-06-02T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'In Progress',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      }),
      transition({
        timestamp: '2024-06-07T00:00:00.000Z',
        fromStatus: 'In Progress',
        toStatus: 'Done',
        fromCategory: 'inProgress',
        toCategory: 'done',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);

    expect(sections).toHaveLength(3);
    expect(sections[0]).toMatchObject({
      statusName: 'Open',
      category: 'todo',
      startDate: barStart,
      endDate: new Date('2024-06-02T00:00:00.000Z'),
    });
    expect(sections[1]).toMatchObject({
      statusName: 'In Progress',
      category: 'inProgress',
      startDate: new Date('2024-06-02T00:00:00.000Z'),
      endDate: new Date('2024-06-07T00:00:00.000Z'),
    });
    expect(sections[2]).toMatchObject({
      statusName: 'Done',
      category: 'done',
      startDate: new Date('2024-06-07T00:00:00.000Z'),
      endDate: barEnd,
    });
  });

  it('uses todo when fromCategory is empty (parseChangelog unresolved side)', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-06-05T00:00:00.000Z',
        fromStatus: 'Weird',
        toStatus: 'Done',
        fromCategory: '',
        toCategory: 'done',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);
    expect(sections[0].category).toBe('todo');
    expect(sections[1].category).toBe('done');
  });

  it('clips when all transitions are before barStart (state at barStart is after last transition)', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-05-01T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'In Progress',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);
    expect(sections).toEqual([
      {
        statusName: 'In Progress',
        category: 'inProgress',
        startDate: barStart,
        endDate: barEnd,
      },
    ]);
  });

  it('clips when transitions start after barEnd (whole bar is initial fromStatus)', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-07-01T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'Done',
        fromCategory: 'todo',
        toCategory: 'done',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);
    expect(sections).toEqual([
      {
        statusName: 'Open',
        category: 'todo',
        startDate: barStart,
        endDate: barEnd,
      },
    ]);
  });

  it('clips internal transitions to [barStart, barEnd]', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-03-01T00:00:00.000Z',
        fromStatus: 'A',
        toStatus: 'B',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      }),
      transition({
        timestamp: '2024-09-01T00:00:00.000Z',
        fromStatus: 'B',
        toStatus: 'C',
        fromCategory: 'inProgress',
        toCategory: 'done',
      }),
    ];

    const windowStart = new Date('2024-06-01T00:00:00.000Z');
    const windowEnd = new Date('2024-08-01T00:00:00.000Z');
    const sections = computeStatusSections(transitions, windowStart, windowEnd);

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      statusName: 'B',
      category: 'inProgress',
      startDate: windowStart,
      endDate: windowEnd,
    });
  });

  it('sorts unsorted transitions by timestamp', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-06-07T00:00:00.000Z',
        fromStatus: 'In Progress',
        toStatus: 'Done',
        fromCategory: 'inProgress',
        toCategory: 'done',
      }),
      transition({
        timestamp: '2024-06-02T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'In Progress',
        fromCategory: 'todo',
        toCategory: 'inProgress',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);
    expect(sections).toHaveLength(3);
    expect(sections[1].statusName).toBe('In Progress');
    expect(sections[1].startDate.getTime()).toBe(new Date('2024-06-02T00:00:00.000Z').getTime());
  });

  it('returns empty array when barEnd is before barStart', () => {
    expect(computeStatusSections([], barEnd, barStart)).toEqual([]);
  });

  it('merges adjacent sections with the same status and category', () => {
    const transitions: StatusTransition[] = [
      transition({
        timestamp: '2024-06-03T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'Open',
        fromCategory: 'todo',
        toCategory: 'todo',
      }),
      transition({
        timestamp: '2024-06-05T00:00:00.000Z',
        fromStatus: 'Open',
        toStatus: 'Done',
        fromCategory: 'todo',
        toCategory: 'done',
      }),
    ];

    const sections = computeStatusSections(transitions, barStart, barEnd);
    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      statusName: 'Open',
      category: 'todo',
      startDate: barStart,
      endDate: new Date('2024-06-05T00:00:00.000Z'),
    });
    expect(sections[1]).toMatchObject({
      statusName: 'Done',
      category: 'done',
    });
  });
});
