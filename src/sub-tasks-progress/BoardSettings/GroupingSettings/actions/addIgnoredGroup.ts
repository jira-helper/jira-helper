import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const addIgnoredGroup = (group: string) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.addIgnoredGroup(group);
};
