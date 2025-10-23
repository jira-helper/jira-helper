import { createAction } from 'src/shared/action';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { throttle } from 'src/shared/utils';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

export const autosyncStoreWithBoardProperty = createAction({
  name: 'autosyncStoreWithBoardProperty',
  async handler() {
    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);
    const throttledUpdate = throttle((data: any) => {
      boardPropertyService.updateBoardProperty('additional-card-elements', data, {});
    }, 5000);
    return useAdditionalCardElementsBoardPropertyStore.subscribe(state => {
      throttledUpdate(state.data);
    });
  },
});
