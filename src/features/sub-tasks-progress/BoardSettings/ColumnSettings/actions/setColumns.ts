import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setColumns = createAction({
  name: 'setColumns',
  handler(columns: { name: string; enabled: boolean }[]) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setColumns(columns);
  },
});
