import { getBoardIdFromURL } from 'src/routing';
import { updateBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { usePersonWipLimitsPropertyStore } from '../store';

/**
 * Writes current property store data to Jira Board Property.
 * updateBoardProperty is fire-and-forget; we return Promise for API consistency.
 */
export const savePersonWipLimitsProperty = async (): Promise<void> => {
  const boardId = getBoardIdFromURL();
  if (!boardId) {
    throw new Error('No board id');
  }

  const { data } = usePersonWipLimitsPropertyStore.getState();
  updateBoardProperty(boardId, BOARD_PROPERTIES.PERSON_LIMITS, data);
  return Promise.resolve();
};
