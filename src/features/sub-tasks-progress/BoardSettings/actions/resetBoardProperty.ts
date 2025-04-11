import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const resetBoardProperty = createAction({
  name: 'resetBoardProperty',
  handler() {
    const initialState = useSubTaskProgressBoardPropertyStore.getInitialState().data;
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: initialState,
    }));
  },
});
