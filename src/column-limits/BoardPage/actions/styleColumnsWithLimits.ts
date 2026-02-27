import { createAction } from 'src/shared/action';
import { columnLimitsBoardPageObjectToken } from '../pageObject';
import { useColumnLimitsRuntimeStore } from '../stores';
import styles from '../styles.module.css';

/**
 * Style columns with limit indicators and over-limit highlighting.
 *
 * For each group:
 * - Highlights columns in red (#ff5630) if group exceeds limit
 * - Inserts badge showing current count / limit on the leftmost column
 *
 * Uses groupStats from runtime store to determine which groups exceed limits.
 */
export const styleColumnsWithLimits = createAction({
  name: 'styleColumnsWithLimits',
  handler(): void {
    const pageObject = this.di.inject(columnLimitsBoardPageObjectToken);
    const { groupStats, ignoredSwimlanes } = useColumnLimitsRuntimeStore.getState().data;
    const columnsInOrder = pageObject.getOrderedColumnIds();

    // Collect all columns that should have badges
    const columnsWithBadges = new Set<string>();

    // First pass: clear old badges and reset background colors
    columnsInOrder.forEach(columnId => {
      pageObject.removeBadges(columnId);
      // Reset background color for all columns in swimlanes
      const swimlanesFilter = ignoredSwimlanes.map(id => `:not([swimlane-id="${id}"])`).join('');
      document
        .querySelectorAll<HTMLElement>(`.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"]`)
        .forEach(el => {
          el.style.backgroundColor = '';
        });
    });

    // Second pass: apply new styles and badges
    groupStats.forEach(stat => {
      // Highlight columns if over limit
      if (stat.isOverLimit) {
        const swimlanesFilter = ignoredSwimlanes.map(id => `:not([swimlane-id="${id}"])`).join('');
        stat.columns.forEach(columnId => {
          document
            .querySelectorAll<HTMLElement>(`.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"]`)
            .forEach(el => {
              el.style.backgroundColor = '#ff5630';
            });
        });
      }

      // Insert badge on leftmost column of group
      const columnIndices = stat.columns
        .map(columnId => columnsInOrder.indexOf(columnId))
        .filter(index => index !== -1);

      if (columnIndices.length > 0) {
        const leftTailColumnIndex = Math.min(...columnIndices);
        const leftTailColumnId = columnsInOrder[leftTailColumnIndex];

        if (leftTailColumnId) {
          columnsWithBadges.add(leftTailColumnId);
          // Use fallback class name if CSS modules don't work in tests
          const badgeClass = styles.limitColumnBadge || 'limitColumnBadge';
          const hintClass = styles.limitColumnBadge__hint || 'limitColumnBadge__hint';
          const badgeHtml = `
          <span class="${badgeClass}" data-column-limits-badge="true">
            ${stat.currentCount}/${stat.limit}
            <span class="${hintClass}">Issues per group / Max number of issues per group</span>
          </span>`;
          pageObject.insertBadge(leftTailColumnId, badgeHtml);
        }
      }
    });
  },
});
