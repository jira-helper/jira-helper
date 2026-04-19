import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardRuntimeModel } from './BoardRuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { WipLimitsProperty } from '../../types';

describe('BoardRuntimeModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockPageObject: IBoardPagePageObject;
  let mockLogger: Logger;

  beforeEach(() => {
    mockPropertyModel = {
      data: {},
    } as unknown as PropertyModel;

    mockPageObject = {
      getOrderedColumnIds: vi.fn(() => ['col1', 'col2', 'col3']),
      getColumnHeaderElement: vi.fn(() => document.createElement('div')),
      getSwimlaneIds: vi.fn(() => []),
      getIssueCountInColumn: vi.fn((columnId: string) => {
        if (columnId === 'col1') return 2;
        if (columnId === 'col2') return 3;
        if (columnId === 'col3') return 1;
        return 0;
      }),
      styleColumnHeader: vi.fn(),
      resetColumnHeaderStyles: vi.fn(),
      insertColumnHeaderHtml: vi.fn(),
      removeColumnHeaderElements: vi.fn(),
      highlightColumnCells: vi.fn(),
      resetColumnCellStyles: vi.fn(),
    } as unknown as IBoardPagePageObject;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  const modelWithData = (data: WipLimitsProperty) => {
    (mockPropertyModel as { data: WipLimitsProperty }).data = data;
    return new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
  };

  describe('calculateStats', () => {
    it('should calculate stats for a single group', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1', 'col2'],
          max: 5,
          customHexColor: '#ff5630',
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(stats).toHaveLength(1);
      expect(stats[0]).toEqual({
        groupId: 'Group 1',
        groupName: 'Group 1',
        columns: ['col1', 'col2'],
        currentCount: 5,
        limit: 5,
        isOverLimit: false,
        color: '#ff5630',
        ignoredSwimlanes: [],
      });

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: [],
        includedIssueTypes: undefined,
        cssFilter: '',
      });
      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col2', {
        ignoredSwimlanes: [],
        includedIssueTypes: undefined,
        cssFilter: '',
      });
      expect(model.groupStats).toEqual(stats);
    });

    it('should detect when group exceeds limit', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1', 'col2'],
          max: 3,
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(stats[0].isOverLimit).toBe(true);
      expect(stats[0].currentCount).toBe(5);
      expect(stats[0].limit).toBe(3);
    });

    it('should generate color when customHexColor is not provided', () => {
      const model = modelWithData({
        'My Group': {
          columns: ['col1'],
          max: 10,
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(stats[0].color).toBeTruthy();
      expect(stats[0].color).not.toBe('');
      expect(typeof stats[0].color).toBe('string');
      expect(stats[0].color.startsWith('#')).toBe(true);
    });

    it('should filter by per-group swimlanes and include ignoredSwimlanes in stats', () => {
      vi.mocked(mockPageObject.getSwimlaneIds).mockReturnValue(['sw1', 'sw2', 'sw3']);

      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
          swimlanes: [{ id: 'sw1', name: 'Frontend' }],
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: ['sw2', 'sw3'],
        includedIssueTypes: undefined,
        cssFilter: '',
      });
      expect(stats[0].ignoredSwimlanes).toEqual(['sw2', 'sw3']);
    });

    it('should count all swimlanes when group.swimlanes is empty', () => {
      vi.mocked(mockPageObject.getSwimlaneIds).mockReturnValue(['sw1', 'sw2', 'sw3']);

      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
          swimlanes: [],
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: [],
        includedIssueTypes: undefined,
        cssFilter: '',
      });
      expect(stats[0].ignoredSwimlanes).toEqual([]);
    });

    it('should count all swimlanes when group.swimlanes is undefined', () => {
      vi.mocked(mockPageObject.getSwimlaneIds).mockReturnValue(['sw1', 'sw2', 'sw3']);

      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: [],
        includedIssueTypes: undefined,
        cssFilter: '',
      });
      expect(stats[0].ignoredSwimlanes).toEqual([]);
    });

    it('should filter by included issue types', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
          includedIssueTypes: ['Task', 'Bug'],
        },
      });
      model.cssNotIssueSubTask = '';

      model.calculateStats();

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: [],
        includedIssueTypes: ['Task', 'Bug'],
        cssFilter: '',
      });
    });

    it('should use cssNotIssueSubTask as cssFilter', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
        },
      });
      model.setCssNotIssueSubTask(':not(.ghx-subtask)');

      model.calculateStats();

      expect(mockPageObject.getIssueCountInColumn).toHaveBeenCalledWith('col1', {
        ignoredSwimlanes: [],
        includedIssueTypes: undefined,
        cssFilter: ':not(.ghx-subtask)',
      });
    });

    it('should skip groups without columns or max', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
        },
        'Group 2': {
          columns: [],
          max: 5,
        },
        'Group 3': {
          columns: ['col2'],
        },
        'Group 4': {
          columns: ['col3'],
          max: 3,
        },
      });
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(stats).toHaveLength(2);
      expect(stats.find(s => s.groupId === 'Group 1')).toBeTruthy();
      expect(stats.find(s => s.groupId === 'Group 4')).toBeTruthy();
      expect(stats.find(s => s.groupId === 'Group 2')).toBeFalsy();
      expect(stats.find(s => s.groupId === 'Group 3')).toBeFalsy();
    });

    it('should calculate stats for multiple groups', () => {
      const model = modelWithData({
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
      model.cssNotIssueSubTask = '';

      const stats = model.calculateStats();

      expect(stats).toHaveLength(2);
      expect(stats[0].groupId).toBe('Group 1');
      expect(stats[0].currentCount).toBe(2);
      expect(stats[0].color).toBe('#ff0000');

      expect(stats[1].groupId).toBe('Group 2');
      expect(stats[1].currentCount).toBe(4);
      expect(stats[1].color).toBe('#00ff00');
    });
  });

  describe('applyColumnHeaderStyles', () => {
    it('should style column headers for grouped columns via pageObject', () => {
      const model = modelWithData({
        G1: {
          columns: ['col1', 'col2'],
          max: 5,
          customHexColor: '#abc',
        },
      });
      model.groupStats = [
        {
          groupId: 'G1',
          groupName: 'G1',
          columns: ['col1', 'col2'],
          currentCount: 1,
          limit: 5,
          isOverLimit: false,
          color: '#abc',
          ignoredSwimlanes: [],
        },
      ];

      model.applyColumnHeaderStyles();

      expect(mockPageObject.resetColumnHeaderStyles).toHaveBeenCalledWith('col1');
      expect(mockPageObject.resetColumnHeaderStyles).toHaveBeenCalledWith('col2');
      expect(mockPageObject.resetColumnHeaderStyles).toHaveBeenCalledWith('col3');
      expect(mockPageObject.styleColumnHeader).toHaveBeenCalled();
      expect(mockPageObject.getOrderedColumnIds).toHaveBeenCalled();
    });

    it('resets every board column header before styling so removed group columns lose decoration', () => {
      const model = modelWithData({
        G1: {
          columns: ['col1'],
          max: 5,
          customHexColor: '#abc',
        },
      });
      model.groupStats = [
        {
          groupId: 'G1',
          groupName: 'G1',
          columns: ['col1'],
          currentCount: 1,
          limit: 5,
          isOverLimit: false,
          color: '#abc',
          ignoredSwimlanes: [],
        },
      ];

      model.applyColumnHeaderStyles();

      const resetCalls = vi.mocked(mockPageObject.resetColumnHeaderStyles).mock.calls.map(([id]) => id);
      expect(resetCalls).toEqual(['col1', 'col2', 'col3']);

      const firstResetOrder = vi.mocked(mockPageObject.resetColumnHeaderStyles).mock.invocationCallOrder[0];
      const firstStyleOrder = vi.mocked(mockPageObject.styleColumnHeader).mock.invocationCallOrder[0];
      expect(firstResetOrder).toBeLessThan(firstStyleOrder);
    });
  });

  describe('applyLimitIndicators', () => {
    it('should reset cells and badges, then highlight and insert badge for over-limit group', () => {
      vi.mocked(mockPageObject.getOrderedColumnIds).mockReturnValue(['col1', 'col2']);

      const model = modelWithData({});
      model.groupStats = [
        {
          groupId: 'G1',
          groupName: 'G1',
          columns: ['col1', 'col2'],
          currentCount: 10,
          limit: 5,
          isOverLimit: true,
          color: '#f00',
          ignoredSwimlanes: ['sw-skip'],
        },
      ];

      model.applyLimitIndicators();

      expect(mockPageObject.removeColumnHeaderElements).toHaveBeenCalledWith('col1', '[data-column-limits-badge]');
      expect(mockPageObject.removeColumnHeaderElements).toHaveBeenCalledWith('col2', '[data-column-limits-badge]');
      expect(mockPageObject.resetColumnCellStyles).toHaveBeenCalledWith('col1');
      expect(mockPageObject.resetColumnCellStyles).toHaveBeenCalledWith('col2');

      expect(mockPageObject.highlightColumnCells).toHaveBeenCalledWith('col1', '#ff5630', ['sw-skip']);
      expect(mockPageObject.highlightColumnCells).toHaveBeenCalledWith('col2', '#ff5630', ['sw-skip']);

      expect(mockPageObject.insertColumnHeaderHtml).toHaveBeenCalled();
      const htmlCall = vi.mocked(mockPageObject.insertColumnHeaderHtml).mock.calls.find(([id]) => id === 'col1');
      expect(htmlCall).toBeDefined();
      expect(htmlCall![1]).toContain('10/5');
      expect(htmlCall![1]).toContain('data-column-limits-badge="true"');
    });
  });

  describe('apply', () => {
    it('should run calculateStats then apply styles and indicators', () => {
      const model = modelWithData({
        'Group 1': {
          columns: ['col1'],
          max: 10,
        },
      });
      model.cssNotIssueSubTask = '';
      const spyCalc = vi.spyOn(model, 'calculateStats');
      const spyHeaders = vi.spyOn(model, 'applyColumnHeaderStyles');
      const spyLimits = vi.spyOn(model, 'applyLimitIndicators');

      model.apply();

      expect(spyCalc).toHaveBeenCalledBefore(spyHeaders);
      expect(spyHeaders).toHaveBeenCalledBefore(spyLimits);
    });
  });

  describe('setCssNotIssueSubTask and reset', () => {
    it('setCssNotIssueSubTask should update state', () => {
      const model = modelWithData({});
      model.setCssNotIssueSubTask('.x');
      expect(model.cssNotIssueSubTask).toBe('.x');
    });

    it('reset should clear groupStats and cssNotIssueSubTask', () => {
      const model = modelWithData({});
      model.groupStats = [
        {
          groupId: 'g',
          groupName: 'g',
          columns: [],
          currentCount: 0,
          limit: 1,
          isOverLimit: false,
          color: '#fff',
          ignoredSwimlanes: [],
        },
      ];
      model.setCssNotIssueSubTask(':not(.sub)');
      model.reset();

      expect(model.groupStats).toEqual([]);
      expect(model.cssNotIssueSubTask).toBe('');
    });
  });
});
