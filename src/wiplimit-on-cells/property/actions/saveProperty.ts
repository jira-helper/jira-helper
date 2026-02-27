import { createAction } from 'src/shared/action';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useWipLimitCellsPropertyStore } from '../store';

/**
 * Writes current property store data to Jira Board Property.
 * updateBoardProperty is fire-and-forget; we return Promise for API consistency.
 */
export const saveWipLimitCellsProperty = createAction({
  name: 'saveWipLimitCellsProperty',
  async handler() {
    const getBoardId = this.di.inject(getBoardIdFromURLToken);
    const updateProperty = this.di.inject(updateBoardPropertyToken);

    const boardId = getBoardId();
    if (!boardId) {
      throw new Error('No board id');
    }

    const { data } = useWipLimitCellsPropertyStore.getState();
    updateProperty(boardId, BOARD_PROPERTIES.WIP_LIMITS_CELLS, data);
  },
});
