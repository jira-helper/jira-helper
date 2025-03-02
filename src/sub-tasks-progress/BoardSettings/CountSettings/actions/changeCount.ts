import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { CountType } from '../../../types';

export const changeCount = (countType: CountType, value: boolean) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.changeCount(countType, value);
};
