import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';

export const init = () => {
  // Register settings tab
  registerSettings({
    title: 'Additional Card Elements',
    component: () => AdditionalCardElementsSettings({}),
  });
};
