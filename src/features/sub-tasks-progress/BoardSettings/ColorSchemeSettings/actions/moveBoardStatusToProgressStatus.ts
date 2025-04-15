import { createAction } from 'src/shared/action';
import { Status } from '../../../types';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const moveBoardStatusToProgressStatus = createAction({
  name: 'moveBoardStatusToProgressStatus',
  handler(boardStatus: number, statusName: string, progressStatus: Status) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setStatusMapping(boardStatus, statusName, progressStatus);
  },
});
