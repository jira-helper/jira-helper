import { createAction } from 'src/shared/action';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { throttle } from 'src/shared/utils';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const autosyncStoreWithBoardProperty = createAction({
  name: 'autosyncStoreWithBoardProperty',
  async handler() {
    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);
    const throttledUpdate = throttle((data: any) => {
      boardPropertyService.updateBoardProperty('sub-task-progress', data, {});
    }, 5000);
    return useSubTaskProgressBoardPropertyStore.subscribe(state => {
      throttledUpdate(state.data);
    });
  },
});
