import { throttle } from 'lodash';
import map from '@tinkoff/utils/array/map';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { mergeSwimlaneSettings } from '../../swimlane/utils';
import { findGroupByColumnId, generateColorByFirstChars } from '../shared/utils';
import { boardPageColumnHeaderBadge } from './htmlTemplates';

export default class ColumnLimitsBoardPage extends PageModification {
  static jiraSelectors = {
    swimlanePool: '#ghx-pool',
    // Jira Cloud
    columnHeaderCloud: '[data-testid="platform-board-kit.common.ui.column-header.header.column-header-container"]',
  };

  shouldApply() {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId() {
    return `add-wip-limits-${this.getBoardId()}`;
  }

  waitForLoading() {
    return this.waitForFirstElement([
      '.ghx-column-header-group',
      ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud,
    ]);
  }

  loadData() {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS),
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
      // Only fetch for jira cloud
      document.querySelector(ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud) ? this.getBoardLatest() : null,
    ]);
  }

  apply(data) {
    if (!data) return;
    const [editData = {}, boardGroups = {}, swimlanesSettings = {}, boardLatest] = data;
    this.boardGroups = boardGroups;
    this.swimlanesSettings = swimlanesSettings;

    /** @type {BoardLatest} */
    this.boardLatest = boardLatest;

    this.mappedColumns = editData.rapidListConfig.mappedColumns.filter(({ isKanPlanColumn }) => !isKanPlanColumn);
    this.cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);

    const throttledStyle = throttle(this.applyStyles.bind(this), 2000);

    this.onDOMChange(ColumnLimitsBoardPage.jiraSelectors.swimlanePool, throttledStyle);
    this.onDOMChange(ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud, throttledStyle, {
      characterData: true,
      childList: false,
      subtree: false,
    });

    this.applyStyles();
  }

  applyStyles() {
    const columnElements = document.querySelectorAll(ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud);
    const isJiraCloud = columnElements.length > 0;
    if (!isJiraCloud) {
      return null;
    }

    this.styleColumnHeaders();
    this.styleColumnsWithLimitations();
  }

  styleColumnHeaders() {
    if (this.boardLatest) {
      const columnElements = document.querySelectorAll(ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud);
      const { columns } = this.boardLatest;
      columns.forEach((columnDef, index) => {
        const { name } = findGroupByColumnId(columnDef.id ? String(columnDef.id) : '', this.boardGroups);
        if (!name) {
          return null;
        }
        const groupColor = this.boardGroups[name].customHexColor || generateColorByFirstChars(name);
        Object.assign(columnElements[index].style, {
          backgroundColor: '#deebff',
          borderTop: `4px solid ${groupColor}`,
        });
      });
      return;
    }

    const columnsInOrder = this.getOrderedColumns();
    // for jira v8 header.
    // One of the parents has overfow: hidden
    const headerGroup = document.querySelector('#ghx-pool-wrapper');

    if (headerGroup != null) {
      headerGroup.style.paddingTop = '10px';
    }

    columnsInOrder.forEach((columnId, index) => {
      const { name, value } = findGroupByColumnId(columnId, this.boardGroups);

      if (!name || !value) return;

      const columnByLeft = findGroupByColumnId(columnsInOrder[index - 1], this.boardGroups);
      const columnByRight = findGroupByColumnId(columnsInOrder[index + 1], this.boardGroups);

      const isColumnByLeftWithSameGroup = columnByLeft.name !== name;
      const isColumnByRightWithSameGroup = columnByRight.name !== name;

      if (isColumnByLeftWithSameGroup)
        document.querySelector(`.ghx-column[data-id="${columnId}"]`).style.borderTopLeftRadius = '10px';
      if (isColumnByRightWithSameGroup)
        document.querySelector(`.ghx-column[data-id="${columnId}"]`).style.borderTopRightRadius = '10px';

      const groupColor = this.boardGroups[name].customHexColor || generateColorByFirstChars(name);
      Object.assign(document.querySelector(`.ghx-column[data-id="${columnId}"]`).style, {
        backgroundColor: '#deebff',
        borderTop: `4px solid ${groupColor}`,
      });
    });
  }

  getIssuesInColumn(columnId, ignoredSwimlanes) {
    const swimlanesFilter = ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('');

    return document.querySelectorAll(
      `.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"] .ghx-issue:not(.ghx-done)${this.cssNotIssueSubTask}`
    ).length;
  }

  insertedBadges = [];

  styleColumnsWithLimitations() {
    const columnElements = document.querySelectorAll(ColumnLimitsBoardPage.jiraSelectors.columnHeaderCloud);
    const isJiraCloud = columnElements.length > 0;

    const columnsInOrder = this.getOrderedColumns();
    if (!columnsInOrder.length) {
      if (!isJiraCloud) {
        return;
      }
      /**
       * Jira cloud only mutations, do not query dom for issues etc
       * Update columns based on board latest data and subgroups response
       */
      while (this.insertedBadges.length > 0) {
        const badge = this.insertedBadges.pop();
        // Clear previously added badges so column doesn't stay busted after update
        badge.remove();
      }
      Object.values(this.boardGroups).forEach(group => {
        const { columns: groupColumns, max: groupLimit } = group;
        if (!groupColumns || !groupLimit) return;

        const amountOfGroupTasks = groupColumns.reduce((acc, columnId) => {
          const column = this.boardLatest?.columns?.find(boardColumn => {
            return boardColumn.id && String(boardColumn.id) === columnId;
          });
          return acc + column.issues.length;
        }, 0);

        groupColumns.forEach(groupColumnId => {
          const index = this.boardLatest?.columns?.findIndex(column => {
            return String(column.id) === String(groupColumnId);
          });
          if (index > -1) {
            const insertedElement = this.insertHTML(
              columnElements[index],
              'beforeend',
              boardPageColumnHeaderBadge({
                isCloud: true,
                amountOfGroupTasks,
                groupLimit,
              })
            );
            this.insertedBadges.push(insertedElement);
          }
        });
      });
    }

    const ignoredSwimlanes = Object.keys(this.swimlanesSettings).filter(
      swimlaneId => this.swimlanesSettings[swimlaneId].ignoreWipInColumns
    );
    const swimlanesFilter = ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('');

    Object.values(this.boardGroups).forEach(group => {
      const { columns: groupColumns, max: groupLimit } = group;
      if (!groupColumns || !groupLimit) return;

      const amountOfGroupTasks = groupColumns.reduce(
        (acc, columnId) => acc + this.getIssuesInColumn(columnId, ignoredSwimlanes),
        0
      );

      if (groupLimit < amountOfGroupTasks) {
        groupColumns.forEach(columnId => {
          document
            .querySelectorAll(`.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"]`)
            .forEach(el => {
              el.style.backgroundColor = '#ff5630';
            });
        });
      }

      const leftTailColumnIndex = Math.min(
        ...groupColumns.map(columnId => columnsInOrder.indexOf(columnId)).filter(index => index != null)
      );
      const leftTailColumnId = columnsInOrder[leftTailColumnIndex];

      if (!leftTailColumnId) {
        // throw `Need rebuild WIP-limits of columns. WIP-limits used not exists column ${leftTailColumnId}`;
        return;
      }

      this.insertHTML(
        document.querySelector(`.ghx-column[data-id="${leftTailColumnId}"]`),
        'beforeend',
        boardPageColumnHeaderBadge({
          amountOfGroupTasks,
          groupLimit,
        })
      );
    });

    this.mappedColumns
      .filter(column => column.max)
      .forEach(column => {
        const totalIssues = this.getIssuesInColumn(column.id, []);
        const filteredIssues = this.getIssuesInColumn(column.id, ignoredSwimlanes);

        if (column.max && totalIssues > Number(column.max) && filteredIssues <= Number(column.max)) {
          const columnHeaderElement = document.querySelector(`.ghx-column[data-id="${column.id}"]`);
          columnHeaderElement.classList.remove('ghx-busted', 'ghx-busted-max');

          // задачи в облачной джире
          document.querySelectorAll(`.ghx-column[data-column-id="${column.id}"]`).forEach(issue => {
            issue.classList.remove('ghx-busted', 'ghx-busted-max');
          });
        }
      });
  }

  getOrderedColumns() {
    return map(
      column => column.dataset.columnId,
      document.querySelectorAll('.ghx-first ul.ghx-columns > li.ghx-column')
    );
  }
}
