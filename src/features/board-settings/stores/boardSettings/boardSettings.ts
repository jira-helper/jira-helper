import { create } from 'zustand';

import { BoardSetting, BoardSettingsState } from './types';

export const useBoardSettingsStore = create<BoardSettingsState>(set => ({
  data: {
    settings: [],
  },
  actions: {
    addSetting: (setting: BoardSetting) => {
      set(state => {
        // Check for duplicate titles
        const isDuplicate = state.data.settings.some(existingSetting => existingSetting.title === setting.title);

        if (isDuplicate) {
          // eslint-disable-next-line no-console
          console.warn(`Setting with title "${setting.title}" already exists`);
          return state;
        }
        return {
          data: {
            settings: [...state.data.settings, setting],
          },
        };
      });
    },
  },
}));
