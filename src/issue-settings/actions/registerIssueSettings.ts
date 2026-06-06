import { createAction } from 'src/shared/action';
import { addIssueSetting, type IssueSetting } from '../issueSettingsModel';

export const registerIssueSettings = createAction({
  name: 'registerIssueSettings',
  handler: (setting: IssueSetting) => {
    addIssueSetting(setting);
  },
});
