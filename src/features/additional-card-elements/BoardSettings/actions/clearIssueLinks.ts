import { createAction } from 'src/shared/action';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

export const clearIssueLinks = createAction({
  name: 'clearIssueLinks',
  handler: () => {
    useAdditionalCardElementsBoardPropertyStore.getState().actions.clearIssueLinks();
  },
});
