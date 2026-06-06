import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok, Err } from 'ts-results';
import { SettingsUIModel } from './SettingsUIModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { PersonLimit } from '../../property/types';

describe('SettingsUIModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockLogger: Logger;
  let model: SettingsUIModel;

  const sampleLimit = (overrides: Partial<PersonLimit> = {}): PersonLimit => ({
    id: 1,
    persons: [
      {
        name: 'testuser',
        displayName: 'Test User',
        self: 'https://test.com/user',
      },
    ],
    limit: 5,
    columns: [],
    swimlanes: [],
    showAllPersonIssues: true,
    ...overrides,
  });

  beforeEach(() => {
    mockPropertyModel = {
      data: { limits: [] },
      setLimits: vi.fn(),
      persist: vi.fn().mockResolvedValue(Ok(undefined)),
    } as unknown as PropertyModel;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;

    model = new SettingsUIModel(mockPropertyModel, mockLogger);
  });

  describe('initial state', () => {
    it('should have empty limits, null editingId and formData', () => {
      expect(model.limits).toEqual([]);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
      expect(model.state).toBe('initial');
    });
  });

  describe('initFromProperty', () => {
    it('should copy limits from propertyModel and reset editing', () => {
      const limit = sampleLimit({ id: 10 });
      mockPropertyModel.data = { limits: [limit] };
      model.limits = [{ ...sampleLimit(), id: 99 }];
      model.editingId = 1;
      model.formData = { persons: [], limit: 1, selectedColumns: [], swimlanes: [] };

      model.initFromProperty();

      expect(model.limits).toHaveLength(1);
      expect(model.limits[0].id).toBe(10);
      expect(model.limits[0]).not.toBe(limit);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
      expect(model.state).toBe('loaded');
    });
  });

  describe('save', () => {
    it('should setLimits on property and return Ok when persist succeeds', async () => {
      const limit = sampleLimit();
      model.limits = [limit];

      const result = await model.save();

      expect(result.ok).toBe(true);
      expect(mockPropertyModel.setLimits).toHaveBeenCalledTimes(1);
      const arg = vi.mocked(mockPropertyModel.setLimits).mock.calls[0][0];
      expect(arg).toHaveLength(1);
      expect(arg[0].id).toBe(1);
      expect(arg[0]).not.toBe(limit);
      expect(mockPropertyModel.persist).toHaveBeenCalled();
    });

    it('should return Err when persist fails', async () => {
      mockPropertyModel.persist = vi.fn().mockResolvedValue(Err(new Error('network')));
      model.limits = [sampleLimit()];

      const result = await model.save();

      expect(result.err).toBe(true);
      if (result.err) {
        expect(result.val.message).toBe('network');
      }
    });
  });

  describe('addLimit', () => {
    it('should push limit and clear formData', () => {
      model.setFormData({ persons: [], limit: 1, selectedColumns: [], swimlanes: [] });
      model.addLimit(sampleLimit());

      expect(model.limits).toHaveLength(1);
      expect(model.formData).toBeNull();
    });
  });

  describe('updateLimit', () => {
    it('should update existing limit and clear editing state', () => {
      model.limits = [sampleLimit()];
      model.editingId = 1;
      model.setFormData({ persons: [], limit: 1, selectedColumns: [], swimlanes: [] });

      model.updateLimit(1, { ...sampleLimit(), limit: 10 });

      expect(model.limits[0].limit).toBe(10);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
    });

    it('should not mutate limits when id not found', () => {
      model.limits = [sampleLimit()];
      model.updateLimit(999, { ...sampleLimit(), id: 999, limit: 10 });

      expect(model.limits[0].limit).toBe(5);
    });
  });

  describe('deleteLimit', () => {
    it('should remove limit and clear editing when matching', () => {
      model.limits = [sampleLimit({ id: 1 }), sampleLimit({ id: 2, persons: [{ name: 'u2', self: '' }] })];
      model.editingId = 1;
      model.setFormData({ persons: [], limit: 1, selectedColumns: [], swimlanes: [] });

      model.deleteLimit(1);

      expect(model.limits).toHaveLength(1);
      expect(model.limits[0].id).toBe(2);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
    });
  });

  describe('setEditingId', () => {
    it('should populate formData from limit when id set', () => {
      model.limits = [
        sampleLimit({
          columns: [{ id: 'col1', name: 'A' }],
          swimlanes: [{ id: 's1', name: 'S' }],
          includedIssueTypes: ['Task'],
        }),
      ];

      model.setEditingId(1);

      expect(model.editingId).toBe(1);
      expect(model.formData).toEqual({
        persons: [{ name: 'testuser', displayName: 'Test User', self: 'https://test.com/user' }],
        limit: 5,
        selectedColumns: ['col1'],
        swimlanes: ['s1'],
        includedIssueTypes: ['Task'],
        showAllPersonIssues: true,
        sharedLimit: false,
      });
    });

    it('should use empty selectedColumns and swimlanes when limit has none (all)', () => {
      model.limits = [sampleLimit()];

      model.setEditingId(1);

      expect(model.formData?.selectedColumns).toEqual([]);
      expect(model.formData?.swimlanes).toEqual([]);
    });

    it('should clear formData when id is null', () => {
      model.setFormData({ persons: [], limit: 1, selectedColumns: [], swimlanes: [] });
      model.setEditingId(null);
      expect(model.formData).toBeNull();
    });

    it('should populate formData with all persons when limit has multiple persons', () => {
      model.limits = [
        sampleLimit({
          persons: [
            { name: 'alice', displayName: 'Alice', self: 'http://jira/a' },
            { name: 'bob', displayName: 'Bob', self: 'http://jira/b' },
          ],
        }),
      ];

      model.setEditingId(1);

      expect(model.formData?.persons).toEqual([
        { name: 'alice', displayName: 'Alice', self: 'http://jira/a' },
        { name: 'bob', displayName: 'Bob', self: 'http://jira/b' },
      ]);
    });
  });

  describe('setLimits', () => {
    it('should replace limits array', () => {
      model.setLimits([sampleLimit(), sampleLimit({ id: 2, persons: [{ name: 'b', self: '' }] })]);
      expect(model.limits).toHaveLength(2);
    });
  });

  describe('moveLimit', () => {
    beforeEach(() => {
      model.limits = [
        sampleLimit({ id: 1, persons: [{ name: 'first', self: '' }] }),
        sampleLimit({ id: 2, persons: [{ name: 'second', self: '' }] }),
        sampleLimit({ id: 3, persons: [{ name: 'third', self: '' }] }),
      ];
    });

    it('should move a limit up', () => {
      model.moveLimit(2, 'up');

      expect(model.limits.map(limit => limit.id)).toEqual([2, 1, 3]);
    });

    it('should move a limit down', () => {
      model.moveLimit(2, 'down');

      expect(model.limits.map(limit => limit.id)).toEqual([1, 3, 2]);
    });

    it('should keep order unchanged at boundaries or when id is missing', () => {
      model.moveLimit(1, 'up');
      model.moveLimit(3, 'down');
      model.moveLimit(999, 'down');

      expect(model.limits.map(limit => limit.id)).toEqual([1, 2, 3]);
    });
  });

  describe('movePersonInLimit', () => {
    beforeEach(() => {
      model.limits = [
        sampleLimit({
          id: 1,
          persons: [
            { name: 'alice', displayName: 'Alice', self: 'http://jira/a' },
            { name: 'bob', displayName: 'Bob', self: 'http://jira/b' },
            { name: 'carol', displayName: 'Carol', self: 'http://jira/c' },
          ],
        }),
      ];
    });

    it('should move a person up inside a multi-person limit', () => {
      model.movePersonInLimit(1, 'bob', 'up');

      expect(model.limits[0].persons.map(person => person.name)).toEqual(['bob', 'alice', 'carol']);
    });

    it('should move a person down inside a multi-person limit', () => {
      model.movePersonInLimit(1, 'bob', 'down');

      expect(model.limits[0].persons.map(person => person.name)).toEqual(['alice', 'carol', 'bob']);
    });

    it('should keep order unchanged at boundaries or when limit/person is missing', () => {
      model.movePersonInLimit(1, 'alice', 'up');
      model.movePersonInLimit(1, 'carol', 'down');
      model.movePersonInLimit(999, 'bob', 'down');
      model.movePersonInLimit(1, 'nobody', 'down');

      expect(model.limits[0].persons.map(person => person.name)).toEqual(['alice', 'bob', 'carol']);
    });
  });

  describe('isDuplicate', () => {
    beforeEach(() => {
      model.limits = [
        sampleLimit({
          columns: [
            { id: 'c2', name: 'B' },
            { id: 'c1', name: 'A' },
          ],
          swimlanes: [
            { id: 'b', name: 'B' },
            { id: 'a', name: 'A' },
          ],
          includedIssueTypes: ['Bug', 'Task'],
        }),
      ];
    });

    it('should return true when person, columns, swimlanes and types match (order ignored)', () => {
      expect(model.isDuplicate(['testuser'], ['c1', 'c2'], ['a', 'b'], ['Task', 'Bug'])).toBe(true);
    });

    it('should return false when columns differ', () => {
      expect(model.isDuplicate(['testuser'], ['c1'], ['a', 'b'], ['Task', 'Bug'])).toBe(false);
    });

    it('should return false when swimlanes differ', () => {
      expect(model.isDuplicate(['testuser'], ['c1', 'c2'], ['a'], ['Task', 'Bug'])).toBe(false);
    });

    it('should return false when issue types differ', () => {
      expect(model.isDuplicate(['testuser'], ['c1', 'c2'], ['a', 'b'], ['Task'])).toBe(false);
    });

    it('should treat missing includedIssueTypes as empty when comparing', () => {
      model.limits = [sampleLimit({ includedIssueTypes: undefined })];
      expect(model.isDuplicate(['testuser'], [], [], undefined)).toBe(true);
      expect(model.isDuplicate(['testuser'], [], [], ['Task'])).toBe(false);
    });

    it('should detect duplicate when any of the new persons matches any existing person with same filters', () => {
      model.limits = [
        sampleLimit({
          persons: [{ name: 'alice', self: '' }],
          columns: [],
          swimlanes: [],
        }),
      ];

      expect(model.isDuplicate(['alice', 'bob'], [], [], undefined)).toBe(true);
      expect(model.isDuplicate(['bob', 'charlie'], [], [], undefined)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should restore initial shape', () => {
      model.limits = [sampleLimit()];
      model.editingId = 1;
      model.setFormData({ persons: [], limit: 1, selectedColumns: [], swimlanes: [] });
      model.state = 'loaded';

      model.reset();

      expect(model.limits).toEqual([]);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
      expect(model.state).toBe('initial');
    });
  });
});
