import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setSubtasksProgressDisplayMode = createAction({
  name: 'setSubtasksProgressDisplayMode',
  handler(displayMode: 'splitLines' | 'singleLine') {
    useSubTaskProgressBoardPropertyStore.getState().actions.setSubtasksProgressDisplayMode(displayMode);
  },
});
