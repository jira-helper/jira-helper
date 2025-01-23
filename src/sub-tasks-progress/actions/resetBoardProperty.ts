import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const resetBoardProperty = () => {
  const initialState = useSubTaskProgressBoardPropertyStore.getInitialState();
  useSubTaskProgressBoardPropertyStore.setState(initialState);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
