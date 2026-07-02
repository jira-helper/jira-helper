import { create } from 'zustand';

import { BOARD_SETTINGS_TAB_IDS } from '../../settingsTabIds';
import { BoardSetting, BoardSettingsState } from './types';

const ORDERED_SETTINGS_TAB_IDS: readonly string[] = [
  BOARD_SETTINGS_TAB_IDS.COLUMN_WIP_LIMITS,
  BOARD_SETTINGS_TAB_IDS.PERSON_WIP_LIMITS,
  BOARD_SETTINGS_TAB_IDS.SUB_TASKS_PROGRESS,
  BOARD_SETTINGS_TAB_IDS.ADDITIONAL_CARD_ELEMENTS,
  BOARD_SETTINGS_TAB_IDS.COMMENT_TEMPLATES,
];

const ALWAYS_LAST_SETTINGS_TAB_IDS: readonly string[] = [
  BOARD_SETTINGS_TAB_IDS.LOCAL_SETTINGS,
  BOARD_SETTINGS_TAB_IDS.DIAGNOSTIC,
];

const getSettingsTabOrder = (setting: BoardSetting) => {
  const orderedIndex = ORDERED_SETTINGS_TAB_IDS.indexOf(setting.id);
  if (orderedIndex >= 0) return orderedIndex;

  const alwaysLastIndex = ALWAYS_LAST_SETTINGS_TAB_IDS.indexOf(setting.id);
  return alwaysLastIndex >= 0 ? ORDERED_SETTINGS_TAB_IDS.length + 1 + alwaysLastIndex : ORDERED_SETTINGS_TAB_IDS.length;
};

const orderSettingsTabs = (settings: BoardSetting[]) =>
  settings
    .map((setting, index) => ({ setting, index }))
    .sort((left, right) => {
      const orderDiff = getSettingsTabOrder(left.setting) - getSettingsTabOrder(right.setting);
      return orderDiff === 0 ? left.index - right.index : orderDiff;
    })
    .map(({ setting }) => setting);

export const useBoardSettingsStore = create<BoardSettingsState>(set => ({
  data: {
    settings: [],
  },
  actions: {
    addSetting: (setting: BoardSetting) => {
      set(state => {
        const isDuplicate = state.data.settings.some(existingSetting => existingSetting.id === setting.id);

        if (isDuplicate) {
          // eslint-disable-next-line no-console
          console.warn(`Setting with id "${setting.id}" already exists`);
          return state;
        }
        return {
          data: {
            settings: orderSettingsTabs([...state.data.settings, setting]),
          },
        };
      });
    },
  },
}));
