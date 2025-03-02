import { useSubTaskProgressBoardPropertyStore } from 'src/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const resetBoardProperty = () => {
  const initialState = useSubTaskProgressBoardPropertyStore.getInitialState();
  useSubTaskProgressBoardPropertyStore.setState(initialState);
};
