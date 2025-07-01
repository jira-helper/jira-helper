import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { CountType, IssueLinkTypeSelection } from '../../../types';

export const changeCount = createAction({
  name: 'changeCount',
  handler(countType: CountType, value: boolean) {
    useSubTaskProgressBoardPropertyStore.getState().actions.changeCount(countType, value);
  },
});

export const setIssueLinkTypesToCount = createAction({
  name: 'setIssueLinkTypesToCount',
  handler(selections: IssueLinkTypeSelection[]) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setIssueLinkTypesToCount(selections);
  },
});

export const clearIssueLinkTypesToCount = createAction({
  name: 'clearIssueLinkTypesToCount',
  handler() {
    useSubTaskProgressBoardPropertyStore.getState().actions.clearIssueLinkTypesToCount();
  },
});
