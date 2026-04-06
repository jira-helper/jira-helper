import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok } from 'ts-results';
import { SettingsUIModel } from './SettingsUIModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';
import { WITHOUT_GROUP_ID } from '../../types';
import type { Column, UIGroup, IssueTypeState } from '../../types';

describe('SettingsUIModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockLogger: Logger;
  let model: SettingsUIModel;

  beforeEach(() => {
    mockPropertyModel = {
      data: {},
      setData: vi.fn(function (this: PropertyModel, data) {
        this.data = data;
      }),
      persist: vi.fn().mockResolvedValue(Ok(undefined)),
    } as unknown as PropertyModel;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;

    model = new SettingsUIModel(mockPropertyModel, mockLogger);
  });

  describe('initial state', () => {
    it('should have empty withoutGroupColumns, groups, and issueTypeSelectorStates', () => {
      expect(model.withoutGroupColumns).toEqual([]);
      expect(model.groups).toEqual([]);
      expect(model.issueTypeSelectorStates).toEqual({});
      expect(model.state).toBe('initial');
    });
  });

  describe('initFromProperty', () => {
    it('should set withoutGroupColumns, groups, and state to loaded', () => {
      const withoutGroupColumns: Column[] = [{ id: 'col1', name: 'To Do' }];
      const groups: UIGroup[] = [{ id: 'g1', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 }];

      model.initFromProperty({ withoutGroupColumns, groups });

      expect(model.withoutGroupColumns).toEqual(withoutGroupColumns);
      expect(model.groups).toEqual(groups);
      expect(model.state).toBe('loaded');
    });

    it('should merge issueTypeSelectorStates when provided', () => {
      const groups: UIGroup[] = [{ id: 'g1', columns: [], max: 3 }];
      const issueTypeSelectorStates: Record<string, IssueTypeState> = {
        g1: { countAllTypes: false, projectKey: 'PRJ', selectedTypes: ['Task', 'Bug'] },
      };

      model.initFromProperty({ withoutGroupColumns: [], groups, issueTypeSelectorStates });

      expect(model.issueTypeSelectorStates.g1).toEqual(issueTypeSelectorStates.g1);
    });
  });

  describe('save', () => {
    it('should build WipLimitsProperty, call setData and persist', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [
          {
            id: 'g1',
            columns: [
              { id: 'col1', name: 'To Do' },
              { id: 'col2', name: 'In Progress' },
            ],
            max: 5,
            customHexColor: '#ff0000',
          },
        ],
      });

      await model.save(['col1', 'col2', 'col3']);

      expect(mockPropertyModel.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          g1: expect.objectContaining({
            columns: ['col1', 'col2'],
            max: 5,
            customHexColor: '#ff0000',
          }),
        })
      );
      expect(mockPropertyModel.persist).toHaveBeenCalled();
    });

    it('should filter out columns not in existingColumnIds', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [
          {
            id: 'g1',
            columns: [
              { id: 'col1', name: 'To Do' },
              { id: 'col2', name: 'Removed' },
            ],
            max: 3,
          },
        ],
      });

      await model.save(['col1']);

      expect(mockPropertyModel.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          g1: expect.objectContaining({ columns: ['col1'] }),
        })
      );
    });

    it('should omit group when all columns filtered out', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [{ id: 'col1', name: 'To Do' }], max: 3 }],
      });

      await model.save(['col2', 'col3']);

      expect(mockPropertyModel.setData).toHaveBeenCalledWith({});
    });

    it('should map includedIssueTypes from issue selector state', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [{ id: 'c1', name: 'A' }], max: 2 }],
      });
      model.setIssueTypeState('g1', {
        countAllTypes: false,
        projectKey: 'P',
        selectedTypes: ['Task', 'Bug'],
      });

      await model.save(['c1']);

      expect(mockPropertyModel.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          g1: expect.objectContaining({
            includedIssueTypes: ['Task', 'Bug'],
          }),
        })
      );
    });

    it('should set includedIssueTypes to empty array when countAllTypes is false and no types', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [{ id: 'c1', name: 'A' }], max: 2 }],
      });
      model.setIssueTypeState('g1', {
        countAllTypes: false,
        projectKey: 'P',
        selectedTypes: [],
      });

      await model.save(['c1']);

      expect(mockPropertyModel.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          g1: expect.objectContaining({
            includedIssueTypes: [],
          }),
        })
      );
    });

    it('should omit includedIssueTypes when countAllTypes is true', async () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [{ id: 'c1', name: 'A' }], max: 2 }],
      });
      model.setIssueTypeState('g1', {
        countAllTypes: true,
        projectKey: 'P',
        selectedTypes: ['Task'],
      });

      await model.save(['c1']);

      const payload = vi.mocked(mockPropertyModel.setData).mock.calls[0][0];
      expect(payload.g1).toBeDefined();
      expect(payload.g1?.includedIssueTypes).toBeUndefined();
    });
  });

  describe('setGroupLimit', () => {
    it('should update group max', () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], max: 3 }],
      });

      model.setGroupLimit('g1', 10);

      expect(model.groups[0].max).toBe(10);
    });
  });

  describe('setGroupColor', () => {
    it('should update group customHexColor', () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], customHexColor: '#000' }],
      });

      model.setGroupColor('g1', '#fff');

      expect(model.groups[0].customHexColor).toBe('#fff');
    });
  });

  describe('setGroupSwimlanes', () => {
    it('should set specific swimlanes for group', () => {
      const swimlanes = [
        { id: 'sw1', name: 'Swimlane 1' },
        { id: 'sw2', name: 'Swimlane 2' },
      ];
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], max: 5 }],
      });

      model.setGroupSwimlanes('g1', swimlanes);

      expect(model.groups[0].swimlanes).toEqual(swimlanes);
    });

    it('should store empty array as undefined (all swimlanes)', () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], swimlanes: [{ id: 'sw1', name: 'S1' }] }],
      });

      model.setGroupSwimlanes('g1', []);

      expect(model.groups[0].swimlanes).toBeUndefined();
    });

    it('should do nothing when group not found', () => {
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], max: 5 }],
      });

      model.setGroupSwimlanes('nonExistent', [{ id: 'sw1', name: 'S1' }]);

      expect(model.groups[0].swimlanes).toBeUndefined();
    });
  });

  describe('setIssueTypeState', () => {
    it('should store issue type state by group id', () => {
      model.initFromProperty({ withoutGroupColumns: [], groups: [{ id: 'g1', columns: [] }] });
      const state: IssueTypeState = {
        countAllTypes: false,
        projectKey: 'K',
        selectedTypes: ['Bug'],
      };

      model.setIssueTypeState('g1', state);

      expect(model.issueTypeSelectorStates.g1).toEqual(state);
    });
  });

  describe('moveColumn', () => {
    it('should move column from withoutGroup to new group', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      model.initFromProperty({ withoutGroupColumns: [col], groups: [] });

      model.moveColumn(col, WITHOUT_GROUP_ID, 'newGroup');

      expect(model.withoutGroupColumns).toEqual([]);
      expect(model.groups).toHaveLength(1);
      expect(model.groups[0].id).toBe('newGroup');
      expect(model.groups[0].columns).toEqual([col]);
      expect(model.groups[0].max).toBe(100);
    });

    it('should move column from one group to another and remove empty source group', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [
          { id: 'g1', columns: [col], max: 5 },
          { id: 'g2', columns: [], max: 3 },
        ],
      });

      model.moveColumn(col, 'g1', 'g2');

      expect(model.groups).toHaveLength(1);
      expect(model.groups[0].id).toBe('g2');
      expect(model.groups[0].columns).toEqual([col]);
    });

    it('should move column from group to withoutGroup', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      model.initFromProperty({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [col], max: 5 }],
      });

      model.moveColumn(col, 'g1', WITHOUT_GROUP_ID);

      expect(model.withoutGroupColumns).toEqual([col]);
      expect(model.groups).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should clear all UI state and set state to initial', () => {
      model.initFromProperty({
        withoutGroupColumns: [{ id: 'c1', name: 'Col' }],
        groups: [{ id: 'g1', columns: [], max: 1 }],
      });
      model.setIssueTypeState('g1', {
        countAllTypes: true,
        projectKey: 'P',
        selectedTypes: [],
      });

      model.reset();

      expect(model.withoutGroupColumns).toEqual([]);
      expect(model.groups).toEqual([]);
      expect(model.issueTypeSelectorStates).toEqual({});
      expect(model.state).toBe('initial');
    });
  });
});
