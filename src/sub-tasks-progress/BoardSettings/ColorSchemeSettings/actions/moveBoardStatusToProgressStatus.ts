import { Status } from '../../../types';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const moveBoardStatusToProgressStatus = (boardStatus: number, statusName: string, progressStatus: Status) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setNewStatusMapping(boardStatus, statusName, progressStatus);
};
