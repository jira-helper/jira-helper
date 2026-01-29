import { savePersonWipLimitsProperty } from '../../property';
import { usePersonWipLimitsPropertyStore } from '../../property/store';
import { useSettingsUIStore } from '../stores/settingsUIStore';

/**
 * Copies UI store limits to property store and persists to Jira.
 * Call when user clicks Save in the settings modal.
 */
export const saveToProperty = async (): Promise<void> => {
  const uiStore = useSettingsUIStore.getState();
  const propertyStore = usePersonWipLimitsPropertyStore.getState();

  propertyStore.actions.setLimits(uiStore.data.limits);
  await savePersonWipLimitsProperty();
};
