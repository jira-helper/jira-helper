import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { globalContainer } from 'dioma';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const setColumns = (columns: { name: string; enabled: boolean }[]) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setColumns(columns);

  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
