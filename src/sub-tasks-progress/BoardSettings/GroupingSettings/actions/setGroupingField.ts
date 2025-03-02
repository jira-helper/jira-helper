import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { GroupFields } from '../../../types';

export const setGroupingField = (groupingField: GroupFields) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setGroupingField(groupingField);
};
