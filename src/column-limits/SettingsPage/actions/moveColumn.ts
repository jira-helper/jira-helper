import type { Column } from '../../types';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';

/**
 * Moves a column from one group to another in the UI store.
 * Call when user drops a column on a different group dropzone.
 */
export const moveColumn = (column: Column, fromGroupId: string, toGroupId: string): void => {
  useColumnLimitsSettingsUIStore.getState().actions.moveColumn(column, fromGroupId, toGroupId);
};
