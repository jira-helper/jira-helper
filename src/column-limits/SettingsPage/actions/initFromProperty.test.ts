import { describe, it, expect, beforeEach } from 'vitest';
import { initFromProperty } from './initFromProperty';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';
import type { Column, UIGroup, IssueTypeState } from '../../types';

describe('initFromProperty', () => {
  beforeEach(() => {
    useColumnLimitsSettingsUIStore.setState(useColumnLimitsSettingsUIStore.getInitialState());
  });

  it('should set UI store with withoutGroupColumns and groups', () => {
    const withoutGroupColumns: Column[] = [{ id: 'col1', name: 'To Do' }];
    const groups: UIGroup[] = [{ id: 'g1', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 }];

    initFromProperty({ withoutGroupColumns, groups });

    const uiState = useColumnLimitsSettingsUIStore.getState();
    expect(uiState.data.withoutGroupColumns).toEqual(withoutGroupColumns);
    expect(uiState.data.groups).toEqual(groups);
    expect(uiState.state).toBe('loaded');
  });

  it('should set issueTypeSelectorStates when provided', () => {
    const groups: UIGroup[] = [{ id: 'g1', columns: [], max: 3 }];
    const issueTypeSelectorStates: Record<string, IssueTypeState> = {
      g1: { countAllTypes: false, projectKey: 'PRJ', selectedTypes: ['Task', 'Bug'] },
    };

    initFromProperty({ withoutGroupColumns: [], groups, issueTypeSelectorStates });

    const uiState = useColumnLimitsSettingsUIStore.getState();
    expect(uiState.data.issueTypeSelectorStates.g1).toEqual(issueTypeSelectorStates.g1);
  });
});
