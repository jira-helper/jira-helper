import { getBoardIdFromURL } from 'src/routing';
import { getBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useWipLimitCellsPropertyStore } from '../store';
import type { WipLimitRange, WipLimitCell } from '../../types';

/**
 * Legacy cell type with backward compatibility for swimline typo.
 * Used only for loading old data format.
 */
type LegacyCell = {
  column: string;
  showBadge: boolean;
  swimlane?: string;
  // @ts-expect-error backward compatibility - old typo in saved data
  swimline?: string;
};

/**
 * Legacy range type for backward compatibility.
 * Used only for loading old data format.
 */
type LegacyRange = {
  name: string;
  wipLimit: number;
  disable?: boolean;
  cells: LegacyCell[];
  includedIssueTypes?: string[];
};

/**
 * Converts legacy cell format (with swimline typo) to current format.
 * Handles backward compatibility: swimline → swimlane
 */
function normalizeCell(cell: LegacyCell): WipLimitCell {
  return {
    column: cell.column,
    showBadge: cell.showBadge,
    swimlane: cell.swimlane ?? cell.swimline ?? '',
  };
}

/**
 * Converts legacy range format to current format.
 * Normalizes all cells to handle backward compatibility.
 */
export function normalizeRange(range: LegacyRange): WipLimitRange {
  return {
    name: range.name,
    wipLimit: range.wipLimit,
    disable: range.disable,
    cells: range.cells.map(normalizeCell),
    includedIssueTypes: range.includedIssueTypes,
  };
}

/**
 * Loads WIP limit cells property from Jira Board Property.
 * Handles backward compatibility: converts swimline → swimlane.
 *
 * @param getBoardProperty - Function to get board property (for dependency injection in tests)
 */
export const loadWipLimitCellsProperty = async (
  getBoardPropertyFn: typeof getBoardProperty = getBoardProperty
): Promise<void> => {
  const store = useWipLimitCellsPropertyStore.getState();
  if (store.state !== 'initial') return;

  store.actions.setState('loading');

  const boardId = getBoardIdFromURL();
  if (!boardId) {
    store.actions.setData([]);
    store.actions.setState('loaded');
    return;
  }

  try {
    const data = await getBoardPropertyFn<LegacyRange[]>(boardId, BOARD_PROPERTIES.WIP_LIMITS_CELLS);
    const normalizedData = data ? data.map(normalizeRange) : [];
    store.actions.setData(normalizedData);
    store.actions.setState('loaded');
  } catch (error) {
    store.actions.setState('error');
    throw error;
  }
};
