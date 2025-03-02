import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const toggleBlockedByLinksAsBlocked = () => {
  useSubTaskProgressBoardPropertyStore.getState().actions.toggleBlockedByLinksAsBlocked();
};
