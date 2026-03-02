import type { GroupMap } from '../../shared/utils';
import type { WipLimitsProperty, Column, UIGroup, IssueTypeState } from '../../types';
import type { InitFromPropertyData } from '../actions/initFromProperty';
import { WITHOUT_GROUP_ID } from '../../types';

/**
 * Builds init data for UI store from GroupMap (DOM + wipLimits) and wipLimits.
 */
export function buildInitDataFromGroupMap(
  groupMap: GroupMap,
  wipLimits: WipLimitsProperty,
  getColumnName: (el: HTMLElement) => string
): InitFromPropertyData {
  const withoutGroupColumns: Column[] = (groupMap.byGroupId[WITHOUT_GROUP_ID]?.allColumnIds ?? []).map(colId => {
    const col = groupMap.byGroupId[WITHOUT_GROUP_ID].byColumnId[colId];
    return { id: col.id, name: getColumnName(col.column) };
  });

  const groups: UIGroup[] = groupMap.allGroupIds
    .filter(groupId => groupId !== WITHOUT_GROUP_ID)
    .map(groupId => {
      const groupData = groupMap.byGroupId[groupId];
      const wipLimit = wipLimits[groupId] ?? {};
      return {
        id: groupId,
        columns: groupData.allColumnIds.map(colId => {
          const col = groupData.byColumnId[colId];
          return { id: col.id, name: getColumnName(col.column) };
        }),
        max: wipLimit.max,
        customHexColor: wipLimit.customHexColor,
        includedIssueTypes: wipLimit.includedIssueTypes,
        swimlanes: wipLimit.swimlanes, // pass through (undefined = all)
      };
    });

  const issueTypeSelectorStates: Record<string, IssueTypeState> = {};
  groupMap.allGroupIds.forEach(groupId => {
    if (groupId === WITHOUT_GROUP_ID) return;
    const group = wipLimits[groupId];
    const includedIssueTypes = group?.includedIssueTypes ?? [];
    issueTypeSelectorStates[groupId] = {
      countAllTypes: !includedIssueTypes || includedIssueTypes.length === 0,
      projectKey: '',
      selectedTypes: includedIssueTypes,
    };
  });

  return {
    withoutGroupColumns,
    groups,
    issueTypeSelectorStates,
  };
}
