import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { CountType } from '../../../types';

export const changeCount = createAction({
  name: 'changeCount',
  handler(countType: CountType, value: boolean) {
    useSubTaskProgressBoardPropertyStore.getState().actions.changeCount(countType, value);
  },
});
