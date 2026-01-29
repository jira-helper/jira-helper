import { usePersonWipLimitsPropertyStore } from '../../property/store';
import { useSettingsUIStore } from '../stores/settingsUIStore';

/**
 * Initializes UI store from property store.
 * Call when opening the settings modal.
 */
export const initFromProperty = (): void => {
  const propertyStore = usePersonWipLimitsPropertyStore.getState();
  const uiStore = useSettingsUIStore.getState();

  uiStore.actions.setLimits([...propertyStore.data.limits]);
  uiStore.actions.setEditingId(null);
  uiStore.actions.setFormData(null);
  uiStore.actions.setCheckedIds([]);
};
