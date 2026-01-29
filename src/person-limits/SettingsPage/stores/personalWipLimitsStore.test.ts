
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsUIStore } from './settingsUIStore';
import type { PersonLimit } from '../state/types';

describe('settingsUIStore', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have empty limits array', () => {
      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toEqual([]);
      expect(state.data.checkedIds).toEqual([]);
      expect(state.data.editingId).toBeNull();
      expect(state.data.formData).toBeNull();
      expect(state.state).toBe('initial');
    });
  });

  describe('setData', () => {
    it('should set limits and update state to loaded', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.setData([limit]);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toHaveLength(1);
      expect(state.data.limits[0]).toEqual(limit);
      expect(state.state).toBe('loaded');
    });
  });

  describe('addLimit', () => {
    it('should add a limit to the array', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toHaveLength(1);
      expect(state.data.limits[0]).toEqual(limit);
      expect(state.data.formData).toBeNull();
    });

    it('should clear formData when adding a limit', () => {
      useSettingsUIStore.getState().actions.setFormData({
        personName: 'test',
        limit: 5,
        selectedColumns: [],
        swimlanes: [],
      });

      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      const state = useSettingsUIStore.getState();
      expect(state.data.formData).toBeNull();
    });
  });

  describe('updateLimit', () => {
    it('should update an existing limit', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      const updatedLimit: PersonLimit = {
        ...limit,
        limit: 10,
      };

      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits[0].limit).toBe(10);
      expect(state.data.editingId).toBeNull();
      expect(state.data.formData).toBeNull();
    });

    it('should not update if limit not found', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      const updatedLimit: PersonLimit = {
        ...limit,
        id: 999,
        limit: 10,
      };

      useSettingsUIStore.getState().actions.updateLimit(999, updatedLimit);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toHaveLength(1);
      expect(state.data.limits[0].limit).toBe(5);
    });
  });

  describe('deleteLimit', () => {
    it('should delete a limit', () => {
      const limit1: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser1',
          displayName: 'Test User 1',
          self: 'https://test.com/user1',
          avatar: 'https://test.com/avatar1.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      const limit2: PersonLimit = {
        id: 2,
        person: {
          name: 'testuser2',
          displayName: 'Test User 2',
          self: 'https://test.com/user2',
          avatar: 'https://test.com/avatar2.png',
        },
        limit: 10,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit1);
      useSettingsUIStore.getState().actions.addLimit(limit2);

      useSettingsUIStore.getState().actions.deleteLimit(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toHaveLength(1);
      expect(state.data.limits[0].id).toBe(2);
    });

    it('should remove limit from checkedIds when deleted', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);
      useSettingsUIStore.getState().actions.setCheckedIds([1]);

      useSettingsUIStore.getState().actions.deleteLimit(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.checkedIds).not.toContain(1);
    });

    it('should clear editingId and formData if deleted limit was being edited', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);
      useSettingsUIStore.getState().actions.setEditingId(1);

      useSettingsUIStore.getState().actions.deleteLimit(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.editingId).toBeNull();
      expect(state.data.formData).toBeNull();
    });
  });

  describe('setCheckedIds', () => {
    it('should set checked IDs', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2, 3]);

      const state = useSettingsUIStore.getState();
      expect(state.data.checkedIds).toEqual([1, 2, 3]);
    });
  });

  describe('toggleChecked', () => {
    it('should add ID to checkedIds if not present', () => {
      useSettingsUIStore.getState().actions.toggleChecked(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.checkedIds).toContain(1);
    });

    it('should remove ID from checkedIds if present', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2]);
      useSettingsUIStore.getState().actions.toggleChecked(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.checkedIds).not.toContain(1);
      expect(state.data.checkedIds).toContain(2);
    });
  });

  describe('setEditingId', () => {
    it('should set editingId and formData when editing', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [{ id: 'col1', name: 'Column 1' }],
        swimlanes: [{ id: 'swim1', name: 'Swimlane 1' }],
        includedIssueTypes: ['bug', 'task'],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);
      useSettingsUIStore.getState().actions.setEditingId(1);

      const state = useSettingsUIStore.getState();
      expect(state.data.editingId).toBe(1);
      expect(state.data.formData).toEqual({
        personName: 'testuser',
        limit: 5,
        selectedColumns: ['col1'],
        swimlanes: ['swim1'],
        includedIssueTypes: ['bug', 'task'],
      });
    });

    it('should clear formData when setting editingId to null', () => {
      useSettingsUIStore.getState().actions.setFormData({
        personName: 'test',
        limit: 5,
        selectedColumns: [],
        swimlanes: [],
      });

      useSettingsUIStore.getState().actions.setEditingId(null);

      const state = useSettingsUIStore.getState();
      expect(state.data.editingId).toBeNull();
      expect(state.data.formData).toBeNull();
    });
  });

  describe('setFormData', () => {
    it('should set formData', () => {
      const formData = {
        personName: 'testuser',
        limit: 5,
        selectedColumns: ['col1'],
        swimlanes: ['swim1'],
      };

      useSettingsUIStore.getState().actions.setFormData(formData);

      const state = useSettingsUIStore.getState();
      expect(state.data.formData).toEqual(formData);
    });
  });

  describe('applyColumnsToSelected', () => {
    it('should apply columns to selected limits', () => {
      const limit1: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser1',
          displayName: 'Test User 1',
          self: 'https://test.com/user1',
          avatar: 'https://test.com/avatar1.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      const limit2: PersonLimit = {
        id: 2,
        person: {
          name: 'testuser2',
          displayName: 'Test User 2',
          self: 'https://test.com/user2',
          avatar: 'https://test.com/avatar2.png',
        },
        limit: 10,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit1);
      useSettingsUIStore.getState().actions.addLimit(limit2);
      useSettingsUIStore.getState().actions.setCheckedIds([1]);

      const columns = [{ id: 'col1', name: 'Column 1' }];
      useSettingsUIStore.getState().actions.applyColumnsToSelected(columns);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits[0].columns).toEqual(columns);
      expect(state.data.limits[1].columns).toEqual([]);
    });
  });

  describe('applySwimlanesToSelected', () => {
    it('should apply swimlanes to selected limits', () => {
      const limit1: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser1',
          displayName: 'Test User 1',
          self: 'https://test.com/user1',
          avatar: 'https://test.com/avatar1.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      const limit2: PersonLimit = {
        id: 2,
        person: {
          name: 'testuser2',
          displayName: 'Test User 2',
          self: 'https://test.com/user2',
          avatar: 'https://test.com/avatar2.png',
        },
        limit: 10,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit1);
      useSettingsUIStore.getState().actions.addLimit(limit2);
      useSettingsUIStore.getState().actions.setCheckedIds([1]);

      const swimlanes = [{ id: 'swim1', name: 'Swimlane 1' }];
      useSettingsUIStore.getState().actions.applySwimlanesToSelected(swimlanes);

      const state = useSettingsUIStore.getState();
      expect(state.data.limits[0].swimlanes).toEqual(swimlanes);
      expect(state.data.limits[1].swimlanes).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);
      useSettingsUIStore.getState().actions.setCheckedIds([1]);
      useSettingsUIStore.getState().actions.setEditingId(1);
      useSettingsUIStore.getState().actions.setState('loaded');

      useSettingsUIStore.getState().actions.reset();

      const state = useSettingsUIStore.getState();
      expect(state.data.limits).toEqual([]);
      expect(state.data.checkedIds).toEqual([]);
      expect(state.data.editingId).toBeNull();
      expect(state.data.formData).toBeNull();
      expect(state.state).toBe('initial');
    });
  });

  describe('Bug fixes - Store level tests (S1-S5)', () => {
    describe('S1: setEditingId устанавливает formData с колонками лимита', () => {
      it('should set formData with columns from limit', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [
            { id: 'col1', name: 'Column 1' },
            { id: 'col2', name: 'Column 2' },
          ],
          swimlanes: [{ id: 'swim1', name: 'Swimlane 1' }],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);

        const state = useSettingsUIStore.getState();
        expect(state.data.formData).not.toBeNull();
        expect(state.data.formData?.selectedColumns).toEqual(['col1', 'col2']);
        expect(state.data.formData?.selectedColumns).toHaveLength(2);
      });

      it('should set formData with includedIssueTypes from limit', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
          includedIssueTypes: ['Task', 'Bug', 'Story'],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);

        const state = useSettingsUIStore.getState();
        expect(state.data.formData).not.toBeNull();
        expect(state.data.formData?.includedIssueTypes).toEqual(['Task', 'Bug', 'Story']);
        expect(state.data.formData?.includedIssueTypes).toHaveLength(3);
      });

      it('should set formData without includedIssueTypes when limit has none', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);

        const state = useSettingsUIStore.getState();
        expect(state.data.formData).not.toBeNull();
        expect(state.data.formData?.includedIssueTypes).toBeUndefined();
      });
    });

    describe('S2: setEditingId(null) очищает formData', () => {
      it('should clear formData when setting editingId to null', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);
        useSettingsUIStore.getState().actions.setEditingId(null);

        const state = useSettingsUIStore.getState();
        expect(state.data.formData).toBeNull();
        expect(state.data.editingId).toBeNull();
      });
    });

    describe('S3: addLimit очищает formData', () => {
      it('should clear formData after adding a limit', () => {
        // Set some formData first
        useSettingsUIStore.getState().actions.setFormData({
          personName: 'test',
          limit: 5,
          selectedColumns: [],
          swimlanes: [],
        });

        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);

        const state = useSettingsUIStore.getState();
        expect(state.data.formData).toBeNull();
      });
    });

    describe('S4: updateLimit очищает editingId и formData', () => {
      it('should clear editingId and formData after updating a limit', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);

        const updatedLimit: PersonLimit = {
          ...limit,
          limit: 10,
        };

        useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);

        const state = useSettingsUIStore.getState();
        expect(state.data.editingId).toBeNull();
        expect(state.data.formData).toBeNull();
      });
    });

    describe('S5: setFormData не влияет на editingId', () => {
      it('should not change editingId when setting formData', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        // editingId should be null initially
        expect(useSettingsUIStore.getState().data.editingId).toBeNull();

        // Set formData
        useSettingsUIStore.getState().actions.setFormData({
          personName: 'test',
          limit: 5,
          selectedColumns: [],
          swimlanes: [],
        });

        const state = useSettingsUIStore.getState();
        expect(state.data.editingId).toBeNull();
        expect(state.data.formData).not.toBeNull();
      });

      it('should preserve editingId when setting formData during edit', () => {
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);
        useSettingsUIStore.getState().actions.setEditingId(1);

        // Set formData during edit
        useSettingsUIStore.getState().actions.setFormData({
          personName: 'updated',
          limit: 10,
          selectedColumns: [],
          swimlanes: [],
        });

        const state = useSettingsUIStore.getState();
        expect(state.data.editingId).toBe(1);
        expect(state.data.formData?.personName).toBe('updated');
      });
    });
  });
});
