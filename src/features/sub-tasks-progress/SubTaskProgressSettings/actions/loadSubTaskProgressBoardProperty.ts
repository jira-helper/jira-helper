import { createAction } from 'src/shared/action';
import { BoardPropertyServiceToken } from '../../../../shared/boardPropertyService';

import { BoardProperty } from '../../types';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const loadSubTaskProgressBoardProperty = createAction({
  name: 'loadSubTaskProgressBoardProperty',
  async handler() {
    const state = useSubTaskProgressBoardPropertyStore.getState();
    const { actions } = state;

    // dont load if it loaded already
    if (state.state === 'loaded' || state.state === 'loading') {
      return;
    }
    actions.setState('loading');

    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);

    const propertyData = await boardPropertyService.getBoardProperty<BoardProperty | undefined>('sub-task-progress');

    if (!propertyData) {
      // TODO: покрыть тестом
      actions.setData({});
      actions.setState('loaded');
      return;
    }
    actions.setData(propertyData);
    actions.setState('loaded');
  },
});
