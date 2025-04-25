import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const addIgnoredGroup = createAction({
  name: 'addIgnoredGroup',
  handler(group: string) {
    useSubTaskProgressBoardPropertyStore.getState().actions.addIgnoredGroup(group);
  },
});
