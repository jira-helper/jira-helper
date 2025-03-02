import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../../../stores/subTaskProgressBoardProperty';

export const toggleBlockedByLinksAsBlocked = () => {
  useSubTaskProgressBoardPropertyStore.getState().actions.toggleBlockedByLinksAsBlocked();
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
