import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { useLocalSettingsStore } from '../stores/localSettingsStore';

export const STORAGE_KEY = 'jira-helper-local-settings';

export const loadLocalSettings = createAction({
  name: 'loadLocalSettings',
  async handler() {
    const newSettings = {};
    try {
      const settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      /**
       * guard to avoid unknown properties
       */
      const whiteList = ['locale'];
      whiteList.forEach(key => {
        if (settings[key]) {
          // @ts-expect-error
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
