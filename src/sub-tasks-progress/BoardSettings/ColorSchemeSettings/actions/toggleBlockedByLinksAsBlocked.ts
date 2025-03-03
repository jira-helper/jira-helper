import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleBlockedByLinksAsBlocked = createAction({
  name: 'toggleBlockedByLinksAsBlocked',
  handler() {
    useSubTaskProgressBoardPropertyStore.getState().actions.toggleBlockedByLinksAsBlocked();
  },
});
