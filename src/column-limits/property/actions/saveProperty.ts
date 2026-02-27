import { createAction } from 'src/shared/action';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useColumnLimitsPropertyStore } from '../store';

/**
 * Writes current property store data to Jira Board Property.
 * updateBoardProperty is fire-and-forget; we return Promise for API consistency.
 */
export const saveColumnLimitsProperty = createAction({
  name: 'saveColumnLimitsProperty',
  async handler() {
    const getBoardId = this.di.inject(getBoardIdFromURLToken);
    const updateProperty = this.di.inject(updateBoardPropertyToken);

    const boardId = getBoardId();
    if (!boardId) {
      throw new Error('No board id');
    }

    const { data } = useColumnLimitsPropertyStore.getState();
    updateProperty(boardId, BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, data);
  },
});
