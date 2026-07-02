import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BOARD_SETTINGS_TAB_IDS } from 'src/features/board-settings/settingsTabIds';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';

export const init = () => {
  // Register settings tab
  registerSettings({
    id: BOARD_SETTINGS_TAB_IDS.ADDITIONAL_CARD_ELEMENTS,
    title: 'Additional Card Elements',
    component: () => AdditionalCardElementsSettings({}),
  });
};
