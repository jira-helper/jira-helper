import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const removeIgnoredGroup = (group: string) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.removeIgnoredGroup(group);
};
