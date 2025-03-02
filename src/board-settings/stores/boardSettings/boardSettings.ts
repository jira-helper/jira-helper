import { create } from 'zustand';

import { BoardSetting, BoardSettingsState } from './types';

export const useBoardSettingsStore = create<BoardSettingsState>(set => ({
  data: {
    settings: [],
  },
  actions: {
    addSetting: (setting: BoardSetting) => {
      set(state => ({
        data: {
          settings: [...state.data.settings, setting],
        },
      }));
    },
  },
}));
