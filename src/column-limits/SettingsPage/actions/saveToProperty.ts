import type { WipLimitsProperty, ColumnLimitGroup } from '../../types';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';
import { useColumnLimitsPropertyStore } from '../../property/store';
import { saveColumnLimitsProperty } from '../../property';

/**
 * Builds WipLimitsProperty from UI store, filters by existing column ids,
 * writes to property store and persists to Jira.
 * Call when user clicks Save in the settings popup.
 *
 * @param existingColumnIds - Column ids that exist on the board (from DOM)
 */
export const saveToProperty = async (existingColumnIds: string[]): Promise<void> => {
  const uiStore = useColumnLimitsSettingsUIStore.getState();
  const propertyStore = useColumnLimitsPropertyStore.getState();

  const wipLimits: WipLimitsProperty = {};

  uiStore.data.groups.forEach(group => {
    const columnIds = group.columns.map(c => c.id).filter(id => existingColumnIds.includes(id));

    if (columnIds.length === 0) return;

    const groupData: ColumnLimitGroup = {
      columns: columnIds,
      max: group.max,
      customHexColor: group.customHexColor,
    };

    const issueState = uiStore.data.issueTypeSelectorStates[group.id];
    if (issueState) {
      if (!issueState.countAllTypes && issueState.selectedTypes.length > 0) {
        groupData.includedIssueTypes = issueState.selectedTypes;
      } else if (!issueState.countAllTypes) {
        groupData.includedIssueTypes = [];
      }
    }

    wipLimits[group.id] = groupData;
  });

  propertyStore.actions.setData(wipLimits);
  await saveColumnLimitsProperty();
};
