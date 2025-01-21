import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { globalContainer } from 'dioma';
import { Status } from '../types';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const moveBoardStatusToProgressStatus = (boardStatus: string, progressStatus: Status) => {
  console.log('🚀 ~ moveBoardStatusToProgressStatus ~ progressStatus:', progressStatus);
  console.log('🚀 ~ moveBoardStatusToProgressStatus ~ boardStatus:', boardStatus);
  useSubTaskProgressBoardPropertyStore.getState().actions.setStatusMapping(boardStatus, progressStatus);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
