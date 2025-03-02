import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../../../stores/subTaskProgressBoardProperty';

export const changeUseCustomColorScheme = (useCustomColorScheme: boolean) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setUseCustomColorScheme(useCustomColorScheme);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
