import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setGroupByFieldHideIfCompleted = createAction({
  name: 'setGroupByFieldHideIfCompleted',
  handler(hideIfCompleted: boolean) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setGroupByFieldHideIfCompleted(hideIfCompleted);
  },
});
