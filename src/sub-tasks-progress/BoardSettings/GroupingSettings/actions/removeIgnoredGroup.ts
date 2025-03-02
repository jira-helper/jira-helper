import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../../../stores/subTaskProgressBoardProperty';

export const removeIgnoredGroup = (group: string) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.removeIgnoredGroup(group);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
