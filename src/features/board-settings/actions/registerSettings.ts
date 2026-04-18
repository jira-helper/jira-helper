import { createAction } from 'src/shared/action';

import { BoardSetting } from '../stores/boardSettings/types';
import { useBoardSettingsStore } from '../stores/boardSettings/boardSettings';

export const registerSettings = createAction({
  name: 'registerSettings',
  handler: (setting: BoardSetting) => {
    useBoardSettingsStore.getState().actions.addSetting(setting);
  },
});
