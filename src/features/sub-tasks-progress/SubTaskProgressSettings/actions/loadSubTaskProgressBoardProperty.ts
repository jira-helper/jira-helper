import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { BoardPropertyServiceToken } from '../../../../shared/boardPropertyService';

import { BoardProperty } from '../../types';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const loadSubTaskProgressBoardProperty = createAction({
  name: 'loadSubTaskProgressBoardProperty',
  async handler() {
    const state = useSubTaskProgressBoardPropertyStore.getState();
    const { actions } = state;
    const log = this.di.inject(loggerToken).getPrefixedLog('loadSubTaskProgressBoardProperty');

    // dont load if it loaded already
    if (state.state === 'loaded' || state.state === 'loading') {
      return;
    }
    actions.setState('loading');

    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);

    const propertyData = await boardPropertyService
      .getBoardProperty<BoardProperty | undefined>('sub-task-progress')
      .catch(e => {
        log(e.toString(), 'error');
        return undefined;
      });

    if (!propertyData) {
      actions.setData({});
      actions.setState('loaded');
      return;
    }
    actions.setData(propertyData);
    actions.setState('loaded');
  },
});
