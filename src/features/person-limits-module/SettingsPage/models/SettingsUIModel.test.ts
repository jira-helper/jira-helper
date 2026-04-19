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
    person: {
      name: 'testuser',
      displayName: 'Test User',
      self: 'https://test.com/user',
    },
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
      model.formData = { person: null, limit: 1, selectedColumns: [], swimlanes: [] };

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
      model.setFormData({ person: null, limit: 1, selectedColumns: [], swimlanes: [] });
      model.addLimit(sampleLimit());

      expect(model.limits).toHaveLength(1);
      expect(model.formData).toBeNull();
    });
  });

  describe('updateLimit', () => {
    it('should update existing limit and clear editing state', () => {
      model.limits = [sampleLimit()];
      model.editingId = 1;
      model.setFormData({ person: null, limit: 1, selectedColumns: [], swimlanes: [] });

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
      model.limits = [sampleLimit({ id: 1 }), sampleLimit({ id: 2, person: { name: 'u2', self: '' } })];
      model.editingId = 1;
      model.setFormData({ person: null, limit: 1, selectedColumns: [], swimlanes: [] });

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
        person: { name: 'testuser', displayName: 'Test User', self: 'https://test.com/user' },
        limit: 5,
        selectedColumns: ['col1'],
        swimlanes: ['s1'],
        includedIssueTypes: ['Task'],
        showAllPersonIssues: true,
      });
    });

    it('should use empty selectedColumns and swimlanes when limit has none (all)', () => {
      model.limits = [sampleLimit()];

      model.setEditingId(1);

      expect(model.formData?.selectedColumns).toEqual([]);
      expect(model.formData?.swimlanes).toEqual([]);
    });

    it('should clear formData when id is null', () => {
      model.setFormData({ person: null, limit: 1, selectedColumns: [], swimlanes: [] });
      model.setEditingId(null);
      expect(model.formData).toBeNull();
    });
  });

  describe('setLimits', () => {
    it('should replace limits array', () => {
      model.setLimits([sampleLimit(), sampleLimit({ id: 2, person: { name: 'b', self: '' } })]);
      expect(model.limits).toHaveLength(2);
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
      expect(model.isDuplicate('testuser', ['c1', 'c2'], ['a', 'b'], ['Task', 'Bug'])).toBe(true);
    });

    it('should return false when columns differ', () => {
      expect(model.isDuplicate('testuser', ['c1'], ['a', 'b'], ['Task', 'Bug'])).toBe(false);
    });

    it('should return false when swimlanes differ', () => {
      expect(model.isDuplicate('testuser', ['c1', 'c2'], ['a'], ['Task', 'Bug'])).toBe(false);
    });

    it('should return false when issue types differ', () => {
      expect(model.isDuplicate('testuser', ['c1', 'c2'], ['a', 'b'], ['Task'])).toBe(false);
    });

    it('should treat missing includedIssueTypes as empty when comparing', () => {
      model.limits = [sampleLimit({ includedIssueTypes: undefined })];
      expect(model.isDuplicate('testuser', [], [], undefined)).toBe(true);
      expect(model.isDuplicate('testuser', [], [], ['Task'])).toBe(false);
    });
  });

  describe('reset', () => {
    it('should restore initial shape', () => {
      model.limits = [sampleLimit()];
      model.editingId = 1;
      model.setFormData({ person: null, limit: 1, selectedColumns: [], swimlanes: [] });
      model.state = 'loaded';

      model.reset();

      expect(model.limits).toEqual([]);
      expect(model.editingId).toBeNull();
      expect(model.formData).toBeNull();
      expect(model.state).toBe('initial');
    });
  });
});
