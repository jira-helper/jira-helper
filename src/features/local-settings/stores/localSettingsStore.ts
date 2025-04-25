import { create } from 'zustand';

import { LocalSettings } from '../types/local-settings';

interface LocalSettingsStore {
  settings: LocalSettings;
  updateSettings: (settings: Partial<LocalSettings>) => void;
}

const DEFAULT_SETTINGS: LocalSettings = {
  locale: 'auto',
};

export const useLocalSettingsStore = create<LocalSettingsStore>(set => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (newSettings: Partial<LocalSettings>) => {
    set(state => {
      const updatedSettings = { ...state.settings, ...newSettings };
      return { settings: updatedSettings };
    });
  },
}));
