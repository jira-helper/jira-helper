import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleFlagsAsBlocked = () => {
  useSubTaskProgressBoardPropertyStore.getState().actions.toggleFlagsAsBlocked();
};
