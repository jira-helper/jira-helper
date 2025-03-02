import { useBoardSettingsStore } from 'src/board-settings/stores/boardSettings/boardSettings';
import { createAction } from 'src/shared/action';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';

export const autosyncStoreWithBoardProperty = createAction({
  name: 'autosyncStoreWithBoardProperty',
  async handler() {
    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);
    return useBoardSettingsStore.subscribe(state => {
      boardPropertyService.updateBoardProperty('sub-task-progress', state.data, {});
    });
  },
});
