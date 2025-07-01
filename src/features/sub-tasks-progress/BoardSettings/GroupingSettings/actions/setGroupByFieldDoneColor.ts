import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setGroupByFieldDoneColor = createAction({
  name: 'setGroupByFieldDoneColor',
  handler(color: string) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setGroupByFieldDoneColor(color);
  },
});
