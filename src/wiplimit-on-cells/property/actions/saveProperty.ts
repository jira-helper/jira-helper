import { getBoardIdFromURL } from 'src/routing';
import { updateBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useWipLimitCellsPropertyStore } from '../store';

/**
 * Writes current property store data to Jira Board Property.
 * updateBoardProperty is fire-and-forget; we return Promise for API consistency.
 *
 * @param updateBoardPropertyFn - Function to update board property (for dependency injection in tests)
 */
export const saveWipLimitCellsProperty = async (
  updateBoardPropertyFn: typeof updateBoardProperty = updateBoardProperty
): Promise<void> => {
  const boardId = getBoardIdFromURL();
  if (!boardId) {
    throw new Error('No board id');
  }

  const { data } = useWipLimitCellsPropertyStore.getState();
  updateBoardPropertyFn(boardId, BOARD_PROPERTIES.WIP_LIMITS_CELLS, data);
  return Promise.resolve();
};
