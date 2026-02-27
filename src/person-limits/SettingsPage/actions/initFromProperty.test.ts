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
    };

    usePersonWipLimitsPropertyStore.getState().actions.setData({ limits: [limit] });
    useSettingsUIStore.getState().actions.setEditingId(1);
    useSettingsUIStore.getState().actions.setFormData({
      person: { name: 'u', displayName: 'u', avatar: '', self: '' },
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
      person: { name: 'u', displayName: 'u', avatar: '', self: '' },
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
});
