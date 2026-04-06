import { findGroupByColumnId, type GroupMap } from '../../shared/utils';
import type { WipLimitsProperty, Column, UIGroup, IssueTypeState } from '../../types';
import type { InitFromPropertyData } from '../models/SettingsUIModel';
import { WITHOUT_GROUP_ID } from '../../types';

/**
 * Builds InitFromPropertyData from a plain Column[] array (no HTML elements needed).
 * Used by SettingsTab on the board page, where columns come from BoardPagePageObject.
 * Semantics align with {@link buildInitDataFromGroupMap}: columns in property under
 * {@link WITHOUT_GROUP_ID} go to `withoutGroupColumns`, not `groups`.
 */
export function buildInitDataFromColumns(columns: Column[], wipLimits: WipLimitsProperty): InitFromPropertyData {
  const withoutGroupColumns: Column[] = [];
  const groupColumnsMap: Record<string, Column[]> = {};

  columns.forEach(col => {
    const group = findGroupByColumnId(col.id, wipLimits);
    if (group.name) {
      if (group.name === WITHOUT_GROUP_ID) {
        withoutGroupColumns.push(col);
      } else {
        if (!groupColumnsMap[group.name]) groupColumnsMap[group.name] = [];
        groupColumnsMap[group.name].push(col);
      }
    } else {
      withoutGroupColumns.push(col);
    }
  });

  const groups: UIGroup[] = Object.entries(groupColumnsMap).map(([groupId, cols]) => {
    const wipLimit = wipLimits[groupId] ?? {};
    return {
      id: groupId,
      columns: cols,
      max: wipLimit.max,
      customHexColor: wipLimit.customHexColor,
      includedIssueTypes: wipLimit.includedIssueTypes,
      swimlanes: wipLimit.swimlanes,
    };
  });

  const issueTypeSelectorStates: Record<string, IssueTypeState> = {};
  groups.forEach(group => {
    const wipGroup = wipLimits[group.id];
    const includedIssueTypes = wipGroup?.includedIssueTypes ?? [];
    issueTypeSelectorStates[group.id] = {
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
