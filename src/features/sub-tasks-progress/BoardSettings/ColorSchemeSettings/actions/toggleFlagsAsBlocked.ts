import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleFlagsAsBlocked = createAction({
  name: 'toggleFlagsAsBlocked',
  handler() {
    useSubTaskProgressBoardPropertyStore.getState().actions.toggleFlagsAsBlocked();
  },
});
