import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const removeIgnoredGroup = createAction({
  name: 'removeIgnoredGroup',
  handler(group: string) {
    useSubTaskProgressBoardPropertyStore.getState().actions.removeIgnoredGroup(group);
  },
});
