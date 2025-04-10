import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleIgnoreStatus = createAction({
  name: 'toggleIgnoreStatus',
  handler(statusId: number) {
    useSubTaskProgressBoardPropertyStore.getState().actions.toggleIgnoredStatus(statusId);
  },
});
