import type { Column, UIGroup, IssueTypeState } from '../../types';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';

export type InitFromPropertyData = {
  withoutGroupColumns: Column[];
  groups: UIGroup[];
  issueTypeSelectorStates?: Record<string, IssueTypeState>;
};

/**
 * Initializes UI store with data from property + DOM.
 * Call when opening the settings popup; pass data built from mapColumnsToGroups + wipLimits.
 */
export const initFromProperty = (data: InitFromPropertyData): void => {
  const uiStore = useColumnLimitsSettingsUIStore.getState();

  uiStore.actions.setData({
    withoutGroupColumns: data.withoutGroupColumns,
    groups: data.groups,
  });

  if (data.issueTypeSelectorStates) {
    Object.entries(data.issueTypeSelectorStates).forEach(([groupId, state]) => {
      uiStore.actions.setIssueTypeState(groupId, state);
    });
  }

  uiStore.actions.setState('loaded');
};
