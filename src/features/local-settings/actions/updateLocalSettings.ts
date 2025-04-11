import { createAction } from 'src/shared/action';
import { useLocalSettingsStore } from '../stores/localSettingsStore';
import { LocalSettings } from '../types/local-settings';
import { STORAGE_KEY } from './loadLocalSettings';

export const updateLocalSettings = createAction({
  name: 'updateLocalSettings',
  async handler(settings: Partial<LocalSettings>) {
    const { updateSettings } = useLocalSettingsStore.getState();
    updateSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(useLocalSettingsStore.getState().settings));
  },
});
