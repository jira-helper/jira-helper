import { createAction } from 'src/shared/action';
import { columnLimitsBoardPageObjectToken } from '../pageObject';
import { useColumnLimitsRuntimeStore } from '../stores';
import { findGroupByColumnId } from '../../shared/utils';

/**
 * Style column headers with group colors and borders.
 *
 * Applies visual grouping to columns:
 * - Background color (#deebff)
 * - Top border with group color
 * - Rounded corners on group boundaries
 *
 * Uses groupStats from runtime store to determine which columns belong to which groups.
 */
export const styleColumnHeaders = createAction({
  name: 'styleColumnHeaders',
  handler(): void {
    const pageObject = this.di.inject(columnLimitsBoardPageObjectToken);
    const { groupStats } = useColumnLimitsRuntimeStore.getState().data;

    // Convert groupStats back to BoardGroup format for findGroupByColumnId
    const boardGroups: Record<string, { columns: string[]; customHexColor?: string; name: string; value: string }> = {};
    groupStats.forEach(stat => {
      boardGroups[stat.groupId] = {
        columns: stat.columns,
        customHexColor: stat.color,
        name: stat.groupName,
        value: stat.groupId,
      };
    });

    const columnsInOrder = pageObject.getOrderedColumnIds();

    // Style each column header
    columnsInOrder.forEach((columnId, index) => {
      const { name, value } = findGroupByColumnId(columnId, boardGroups);
      if (!name || !value) return;

      const columnByLeft = findGroupByColumnId(columnsInOrder[index - 1], boardGroups);
      const columnByRight = findGroupByColumnId(columnsInOrder[index + 1], boardGroups);

      const el = pageObject.getColumnElement(columnId);
      if (!el) return;

      const groupColor = boardGroups[name].customHexColor;

      const styles: Partial<CSSStyleDeclaration> = {
        backgroundColor: '#deebff',
        borderTop: `4px solid ${groupColor}`,
      };

      if (columnByLeft.name !== name) {
        styles.borderTopLeftRadius = '10px';
      }
      if (columnByRight.name !== name) {
        styles.borderTopRightRadius = '10px';
      }

      pageObject.styleColumn(columnId, styles);
    });

    // Add padding to header group for Jira v8
    const headerGroup = document.querySelector<HTMLElement>('#ghx-pool-wrapper');
    if (headerGroup != null) {
      headerGroup.style.paddingTop = '10px';
    }
  },
});
