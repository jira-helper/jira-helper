import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { GroupFields } from '../../../types';

export const setGroupingField = createAction({
  name: 'setGroupingField',
  handler(groupingField: GroupFields) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setGroupingField(groupingField);
  },
});
