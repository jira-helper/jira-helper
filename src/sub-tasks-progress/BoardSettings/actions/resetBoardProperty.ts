import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from 'src/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const resetBoardProperty = createAction({
  name: 'resetBoardProperty',
  handler() {
    const initialState = useSubTaskProgressBoardPropertyStore.getInitialState();
    useSubTaskProgressBoardPropertyStore.setState(initialState);
  },
});
