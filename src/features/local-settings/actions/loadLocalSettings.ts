import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { useLocalSettingsStore } from '../stores/localSettingsStore';

export const STORAGE_KEY = 'jira-helper-local-settings';
const LOCAL_SETTINGS_WHITELIST = ['locale'];
export const loadLocalSettings = createAction({
  name: 'loadLocalSettings',
  async handler() {
    const newSettings = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const settings = JSON.parse(raw || '{}');
      /**
       * guard to avoid unknown properties
       */

      LOCAL_SETTINGS_WHITELIST.forEach(key => {
        if (settings[key]) {
          // @ts-expect-error - legacy
          newSettings[key] = settings[key];
        }
      });
    } catch (error: any) {
      this.di.inject(loggerToken).getPrefixedLog('loadLocalSettings')(error.toString(), 'error');
      return;
    }

    useLocalSettingsStore.getState().updateSettings(newSettings);
  },
});
