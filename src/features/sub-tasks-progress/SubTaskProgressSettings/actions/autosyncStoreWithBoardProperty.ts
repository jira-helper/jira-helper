import { createAction } from 'src/shared/action';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const autosyncStoreWithBoardProperty = createAction({
  name: 'autosyncStoreWithBoardProperty',
  async handler() {
    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);
    return useSubTaskProgressBoardPropertyStore.subscribe(state => {
      boardPropertyService.updateBoardProperty('sub-task-progress', state.data, {});
    });
  },
});
