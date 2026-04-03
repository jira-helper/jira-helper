import { describe, it, expect, beforeEach } from 'vitest';
import { initFromProperty } from './initFromProperty';
import { usePersonWipLimitsPropertyStore } from '../../property/store';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../../property/types';

describe('initFromProperty', () => {
  beforeEach(() => {
    usePersonWipLimitsPropertyStore.getState().actions.reset();
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
  });

  it('should copy limits from property store to UI store', () => {
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'u',
        displayName: 'U',
        self: '',
        avatar: '',
      },
      limit: 5,
      columns: [],
      swimlanes: [],
      showAllPersonIssues: true,
    };

    usePersonWipLimitsPropertyStore.getState().actions.setData({ limits: [limit] });
    useSettingsUIStore.getState().actions.setEditingId(1);
    useSettingsUIStore.getState().actions.setFormData({
      person: { name: 'u', displayName: 'u', self: '' },
      limit: 5,
      selectedColumns: [],
      swimlanes: [],
    });
    initFromProperty();

    const uiState = useSettingsUIStore.getState();
    expect(uiState.data.limits).toHaveLength(1);
    expect(uiState.data.limits[0].limit).toBe(5);
    expect(uiState.data.editingId).toBeNull();
    expect(uiState.data.formData).toBeNull();
  });

  it('should reset UI store when property store is empty', () => {
    useSettingsUIStore.getState().actions.setEditingId(1);
    useSettingsUIStore.getState().actions.setFormData({
      person: { name: 'u', displayName: 'u', self: '' },
      limit: 5,
      selectedColumns: [],
      swimlanes: [],
    });

    initFromProperty();

    const uiState = useSettingsUIStore.getState();
    expect(uiState.data.limits).toEqual([]);
    expect(uiState.data.editingId).toBeNull();
    expect(uiState.data.formData).toBeNull();
  });

  it('should handle legacy data with avatar field (backward compatibility)', () => {
    const legacyLimit: PersonLimit = {
      id: 1,
      person: {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
        avatar: 'https://jira.example.com/secure/useravatar?avatarId=12345',
      },
      limit: 3,
      columns: [{ id: 'col-1', name: 'In Progress' }],
      swimlanes: [],
      showAllPersonIssues: true,
    };

    usePersonWipLimitsPropertyStore.getState().actions.setData({ limits: [legacyLimit] });

    initFromProperty();

    const uiState = useSettingsUIStore.getState();
    expect(uiState.data.limits).toHaveLength(1);
    expect(uiState.data.limits[0].person.name).toBe('john.doe');
    expect(uiState.data.limits[0].limit).toBe(3);
  });
});
