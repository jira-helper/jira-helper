import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleIgnoreStatus = (statusId: number) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.toggleIgnoredStatus(statusId);
};
