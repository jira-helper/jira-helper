import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { useLocalSettingsStore } from '../stores/localSettingsStore';
import { LocalSettings } from '../types/local-settings';
import { STORAGE_KEY } from './loadLocalSettings';

export const updateLocalSettings = createAction({
  name: 'updateLocalSettings',
  async handler(settings: Partial<LocalSettings>) {
    const { updateSettings } = useLocalSettingsStore.getState();
    const log = this.di.inject(loggerToken).getPrefixedLog('updateLocalSettings');
    updateSettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(useLocalSettingsStore.getState().settings));
    } catch (e: any) {
      log(e.toString(), 'error');
    }
  },
});
