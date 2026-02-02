import { getBoardIdFromURL } from 'src/routing';
import { updateBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useColumnLimitsPropertyStore } from '../store';

/**
 * Writes current property store data to Jira Board Property.
 * updateBoardProperty is fire-and-forget; we return Promise for API consistency.
 */
export const saveColumnLimitsProperty = async (): Promise<void> => {
  const boardId = getBoardIdFromURL();
  if (!boardId) {
    throw new Error('No board id');
  }

  const { data } = useColumnLimitsPropertyStore.getState();
  updateBoardProperty(boardId, BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, data);
  return Promise.resolve();
};
