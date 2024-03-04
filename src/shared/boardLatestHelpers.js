import { intersection } from 'lodash';

/**
 * @param {BoardLatest} boardLatest
 * @param {string | number } columnId
 * @returns {BoardLatestColumn}
 */
export const getColumnById = (boardLatest, columnId) => {
  return boardLatest?.columns?.find(column => {
    return String(column?.id) === String(columnId);
  });
};

/**
 * @param {BoardLatest} boardLatest
 * @param {string | number } swimlaneId
 * @returns {BoardLatestSwimlane}
 */
export const getSwimlaneById = (boardLatest, swimlaneId) => {
  return boardLatest?.swimlaneInfo?.swimlanes?.find(swimlane => {
    return String(swimlane?.id) === String(swimlaneId);
  });
};

/**
 *
 * @param {BoardLatest} boardLatest
 * @param {string | number} columnId
 * @returns {Array<string | number>}
 */
export const getIssueIdsByColumnId = (boardLatest, columnId) => {
  const column = getColumnById(boardLatest, columnId);

  return (
    column?.issues?.map(issue => {
      return issue?.id;
    }) ?? []
  );
};

/**
 * @param {BoardLatest} boardLatest
 * @param {string | number} swimlaneId
 * @returns {Array<string | number>}
 */
export const getIssueIdsBySwimlaneId = (boardLatest, swimlaneId) => {
  const swimlane = getSwimlaneById(boardLatest, swimlaneId);
  return swimlane?.issueIds ?? [];
};

/**
 * @param {BoardLatest} boardLatest
 * @param {string | number} swimlaneId
 * @param {string | number} columnId
 * @returns {Array<string | number>}
 */
export const getIssueIdsBySwimlaneIdAndColumnId = (boardLatest, swimlaneId, columnId) => {
  const swimlaneIds = getIssueIdsBySwimlaneId(boardLatest, swimlaneId);
  const columnIds = getIssueIdsByColumnId(boardLatest, columnId);

  return intersection(swimlaneIds, columnIds);
};
