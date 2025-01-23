import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { globalContainer } from 'dioma';
import { Status } from '../types';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const moveBoardStatusToProgressStatus = (boardStatus: string, progressStatus: Status) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setStatusMapping(boardStatus, progressStatus);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};

export const newMoveBoardStatusToProgressStatus = (boardStatus: number, statusName: string, progressStatus: Status) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setNewStatusMapping(boardStatus, statusName, progressStatus);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};
