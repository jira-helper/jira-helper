import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { columnLimitsBoardPageObjectToken } from '../pageObject';
import type { IColumnLimitsBoardPageObject } from '../pageObject';
import { useColumnLimitsRuntimeStore, getInitialState } from '../stores';
import { useColumnLimitsPropertyStore } from '../../property';
import { calculateGroupStats } from './calculateGroupStats';

describe('calculateGroupStats', () => {
  let mockPageObject: IColumnLimitsBoardPageObject;

  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);

    // Create mock PageObject
    mockPageObject = {
      getOrderedColumnIds: vi.fn(() => ['col1', 'col2', 'col3']),
      getColumnElement: vi.fn(() => document.createElement('div')),
      getIssuesInColumn: vi.fn((columnId: string) => {
        // Mock: col1 has 2 issues, col2 has 3 issues, col3 has 1 issue
        if (columnId === 'col1') return 2;
        if (columnId === 'col2') return 3;
        if (columnId === 'col3') return 1;
        return 0;
      }),
      styleColumn: vi.fn(),
      insertBadge: vi.fn(),
      getSwimlaneIds: vi.fn(() => []),
      shouldCountIssue: vi.fn(() => true),
    };

    globalContainer.register({
      token: columnLimitsBoardPageObjectToken,
      value: mockPageObject,
    });

    useColumnLimitsRuntimeStore.setState(getInitialState());
    useColumnLimitsPropertyStore.getState().actions.reset();
  });

  afterEach(() => {
    globalContainer.reset();
    document.body.innerHTML = '';
  });

  it('should calculate stats for a single group', () => {
    // Setup property store with one group
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1', 'col2'],
        max: 5,
        customHexColor: '#ff5630',
      },
    });

    // Setup runtime store
    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    // Act
    const stats = calculateGroupStats();

    // Assert
    expect(stats).toHaveLength(1);
    expect(stats[0]).toEqual({
      groupId: 'Group 1',
      groupName: 'Group 1',
      columns: ['col1', 'col2'],
      currentCount: 5, // 2 + 3
      limit: 5,
      isOverLimit: false,
      color: '#ff5630',
    });

    expect(mockPageObject.getIssuesInColumn).toHaveBeenCalledWith('col1', [], undefined, '');
    expect(mockPageObject.getIssuesInColumn).toHaveBeenCalledWith('col2', [], undefined, '');
  });

  it('should detect when group exceeds limit', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1', 'col2'],
        max: 3, // Limit is 3, but we have 5 issues
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    const stats = calculateGroupStats();

    expect(stats[0].isOverLimit).toBe(true);
    expect(stats[0].currentCount).toBe(5);
    expect(stats[0].limit).toBe(3);
  });

  it('should generate color when customHexColor is not provided', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'My Group': {
        columns: ['col1'],
        max: 10,
        // No customHexColor
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    const stats = calculateGroupStats();

    expect(stats[0].color).toBeTruthy();
    expect(stats[0].color).not.toBe('');
    expect(typeof stats[0].color).toBe('string');
    expect(stats[0].color.startsWith('#')).toBe(true);
  });

  it('should filter by ignored swimlanes', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1'],
        max: 10,
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes(['swimlane1']);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    calculateGroupStats();

    expect(mockPageObject.getIssuesInColumn).toHaveBeenCalledWith('col1', ['swimlane1'], undefined, '');
  });

  it('should filter by included issue types', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1'],
        max: 10,
        includedIssueTypes: ['Task', 'Bug'],
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    calculateGroupStats();

    expect(mockPageObject.getIssuesInColumn).toHaveBeenCalledWith('col1', [], ['Task', 'Bug'], '');
  });

  it('should use cssNotIssueSubTask selector', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1'],
        max: 10,
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask(':not(.ghx-subtask)');

    calculateGroupStats();

    expect(mockPageObject.getIssuesInColumn).toHaveBeenCalledWith('col1', [], undefined, ':not(.ghx-subtask)');
  });

  it('should skip groups without columns or max', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1'],
        max: 10,
      },
      'Group 2': {
        // No columns
        max: 5,
      },
      'Group 3': {
        columns: ['col2'],
        // No max
      },
      'Group 4': {
        columns: ['col3'],
        max: 3,
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    const stats = calculateGroupStats();

    // Should only include Group 1 and Group 4
    expect(stats).toHaveLength(2);
    expect(stats.find(s => s.groupId === 'Group 1')).toBeTruthy();
    expect(stats.find(s => s.groupId === 'Group 4')).toBeTruthy();
    expect(stats.find(s => s.groupId === 'Group 2')).toBeFalsy();
    expect(stats.find(s => s.groupId === 'Group 3')).toBeFalsy();
  });

  it('should calculate stats for multiple groups', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      'Group 1': {
        columns: ['col1'],
        max: 10,
        customHexColor: '#ff0000',
      },
      'Group 2': {
        columns: ['col2', 'col3'],
        max: 5,
        customHexColor: '#00ff00',
      },
    });

    useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes([]);
    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');

    const stats = calculateGroupStats();

    expect(stats).toHaveLength(2);
    expect(stats[0].groupId).toBe('Group 1');
    expect(stats[0].currentCount).toBe(2); // col1 has 2 issues
    expect(stats[0].color).toBe('#ff0000');

    expect(stats[1].groupId).toBe('Group 2');
    expect(stats[1].currentCount).toBe(4); // col2 (3) + col3 (1)
    expect(stats[1].color).toBe('#00ff00');
  });
});
