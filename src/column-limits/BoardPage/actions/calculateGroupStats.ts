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
 * - Current issue count per group (filtered by per-group swimlanes)
 * - Whether group exceeds its limit
 * - Color for group visualization
 *
 * Swimlane filtering logic:
 * - If group.swimlanes is undefined or empty → count all swimlanes
 * - If group.swimlanes has specific swimlanes → count only those, ignore others
 *
 * @returns Array of GroupStats, one per configured group
 */
export const calculateGroupStats = createAction({
  name: 'calculateGroupStats',
  handler(): GroupStats[] {
    const pageObject = this.di.inject(columnLimitsBoardPageObjectToken);
    const { data: propertyData } = useColumnLimitsPropertyStore.getState();
    const { cssNotIssueSubTask } = useColumnLimitsRuntimeStore.getState().data;

    // Get all swimlane IDs from the board for filtering calculation
    const allSwimlaneIds = pageObject.getSwimlaneIds();

    const stats: GroupStats[] = [];

    Object.entries(propertyData).forEach(([groupName, group]) => {
      const { columns, max, customHexColor, includedIssueTypes, swimlanes } = group;
      if (!columns || columns.length === 0 || !max) return;

      // Calculate ignored swimlanes for this group
      // Empty or undefined swimlanes = all (no ignored)
      // Specific swimlanes = ignore all others
      const groupSwimlaneIds = swimlanes?.map(s => s.id) ?? [];
      const ignoredSwimlanes =
        groupSwimlaneIds.length === 0 ? [] : allSwimlaneIds.filter(id => !groupSwimlaneIds.includes(id));

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
