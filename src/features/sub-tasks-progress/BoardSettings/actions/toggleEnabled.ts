import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleEnabled = createAction({
  name: 'toggleEnabled',
  handler() {
    useSubTaskProgressBoardPropertyStore.getState().actions.toggleEnabled();
  },
});
