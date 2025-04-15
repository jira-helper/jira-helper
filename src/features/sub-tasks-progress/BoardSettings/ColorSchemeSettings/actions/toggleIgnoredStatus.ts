import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const ToggleIgnoredStatus = createAction({
  name: 'toggleIgnoredStatus',
  handler(statusId: number) {
    useSubTaskProgressBoardPropertyStore.getState().actions.toggleIgnoredStatus(statusId);
  },
});
