import { createAction } from 'src/shared/action';
import { columnLimitsBoardPageObjectToken } from '../pageObject';
import { useColumnLimitsPropertyStore } from '../../property';
import { useColumnLimitsRuntimeStore } from '../stores';
import type { GroupStats } from '../stores/runtimeStore.types';
import { generateColorByFirstChars } from '../../shared/utils';

/**
 * Calculate statistics for all column limit groups.
 *
 * Reads groups from property store and computes:
 * - Current issue count per group
 * - Whether group exceeds its limit
 * - Color for group visualization
 *
 * @returns Array of GroupStats, one per configured group
 */
export const calculateGroupStats = createAction({
  name: 'calculateGroupStats',
  handler(): GroupStats[] {
    const pageObject = this.di.inject(columnLimitsBoardPageObjectToken);
    const { data: propertyData } = useColumnLimitsPropertyStore.getState();
    const { ignoredSwimlanes, cssNotIssueSubTask } = useColumnLimitsRuntimeStore.getState().data;

    const stats: GroupStats[] = [];

    Object.entries(propertyData).forEach(([groupName, group]) => {
      const { columns, max, customHexColor, includedIssueTypes } = group;
      if (!columns || columns.length === 0 || !max) return;

      const currentCount = columns.reduce(
        (acc, columnId) =>
          acc + pageObject.getIssuesInColumn(columnId, ignoredSwimlanes, includedIssueTypes, cssNotIssueSubTask),
        0
      );

      stats.push({
        groupId: groupName,
        groupName,
        columns,
        currentCount,
        limit: max,
        isOverLimit: currentCount > max,
        color: customHexColor || generateColorByFirstChars(groupName),
      });
    });

    return stats;
  },
});
