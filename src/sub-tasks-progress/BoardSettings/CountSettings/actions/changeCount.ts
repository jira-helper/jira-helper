import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../../../stores/subTaskProgressBoardProperty';
import { CountType } from '../../../types';

export const changeCount = (countType: CountType, value: boolean) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.changeCount(countType, value);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
