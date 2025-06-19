import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setGroupByFieldPendingColor = createAction({
  name: 'setGroupByFieldPendingColor',
  handler(color: string) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setGroupByFieldPendingColor(color);
  },
});
