import { createAction } from 'src/shared/action';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueLink } from '../../types';

export const setIssueLinks = createAction({
  name: 'setIssueLinks',
  handler: (issueLinks: IssueLink[]) => {
    useAdditionalCardElementsBoardPropertyStore.getState().actions.setIssueLinks(issueLinks);
  },
});
