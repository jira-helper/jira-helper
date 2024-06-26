import { throttle } from 'lodash';
import { PageModification } from '../shared/PageModification';
import { BOARD_PROPERTIES } from '../shared/constants';
import { settingsJiraDOM as DOM } from '../swimlane/constants';
import { getIssueIdsBySwimlaneIdAndColumnId, getSwimlaneById } from '../shared/boardLatestHelpers';

/**
 * @typedef WipLimitData
 * @type {object}
 * @property {string} name
 * @property {number} wipLimit
 * Required fields we get from api call, optional fields in cells we add later
 * @property {Array<{
 *  swimlane: string,
 *  column: string,
 *  showBadge: boolean,
 *  notFoundOnBoard?: boolean,
 *  DOM?: HTMLElement,
 *  x?: number,
 *  y?: number,
 *  border?: string,
 * }>} cells
 * @property {Array<Array<number>>} matrixRange
 */

/**
 * @property {Array<WipLimitData>} wip
 */
export default class extends PageModification {
  waitForLoading() {
    return this.waitForFirstElement(['.ghx-swimlane', DOM.swimlaneCloudWrapper]);
  }

  getModificationId() {
    return `SLAIndicatorTitle-shows-${this.getBoardId()}`;
  }

  shouldApply() {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  loadData() {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS),
      // Only fetch for jira cloud
      this.getBoardLatest().catch(() => null),
    ]);
  }

  async apply(data) {
    if (!data) return;
    const [editData, WipLimitSetting, boardLatest] = data;

    if (!WipLimitSetting) {
      return;
    }

    this.wip = WipLimitSetting;
    this.boardLatest = boardLatest;
    this.counterCssSelector = this.getCssSelectorOfIssues(editData);

    // These methods mutate a lot of data, so it's not safe to call both
    const isJiraCloud = document.querySelector(DOM.swimlaneCloudWrapper) !== null;
    if (isJiraCloud) {
      this.renderWipLimitCloud();

      const throttledRender = throttle(this.renderWipLimitCloud.bind(this), 2000);
      this.onDOMChange(DOM.swimlaneCloudWrapper, throttledRender, {
        subtree: true,
        childList: true,
      });
    } else {
      this.renderWipLimitCells();
      this.onDOMChange('#ghx-pool', () => this.renderWipLimitCells());
    }
  }

  renderWipLimitCells() {
    const ArrayOfCells = this.getCells();
    const emptyMartix = this.getEmptyMartix(ArrayOfCells);
    for (const range of this.wip) {
      let countIssues = 0;

      const matrixRange = this.arrayClone(emptyMartix);
      for (const cell of range.cells) {
        const selector = `[swimlane-id='${cell.swimlane}'] [data-column-id='${cell.column}']`;
        const [cellsDOM] = document.querySelectorAll(selector);
        if (cellsDOM) {
          const { length } = cellsDOM.querySelectorAll(this.counterCssSelector);
          countIssues += length;
          cell.DOM = cellsDOM;
          const XY = this.excludeCells(ArrayOfCells, matrixRange, cellsDOM);
          cell.x = XY.s;
          cell.y = XY.c;
        } else {
          cell.notFoundOnBoard = true;
        }
      }
      range.matrixRange = this.invertMatrix(ArrayOfCells, matrixRange, emptyMartix);
      let colorBadge;

      if (countIssues === range.wipLimit) {
        colorBadge = '#ffd700"';
      } else if (countIssues > range.wipLimit) {
        colorBadge = '#ff5630"';
      }

      for (const cell of range.cells) {
        if (!cell.notFoundOnBoard) {
          if (range.disable) {
            cell.DOM.classList.add('WipLimitCells_disable');
          }

          cell.border = this.setBorderString(cell, range.matrixRange);
          this.cellAddClasses(cell, countIssues, range.wipLimit);

          if (cell.showBadge) {
            cell.DOM.insertAdjacentHTML('afterbegin', this.getGetRengeDOM(countIssues, range.wipLimit, colorBadge));
          }
        }
      }
    }
  }

  renderWipLimitCloud() {
    // Remove prevously added badge
    document.querySelectorAll('.WipLimitCellsBadge.field-issues-count').forEach(badge => {
      badge.remove();
    });

    for (const range of this.wip) {
      // issue count by column and swimlane
      for (const cell of range.cells) {
        const issuesInCell = getIssueIdsBySwimlaneIdAndColumnId(this.boardLatest, cell.swimlane, cell.column).length;

        this.markCell(cell, range, issuesInCell);
      }
    }
  }

  getSwimlaneColumn(swimlaneId, columnId) {
    const swimlaneText = getSwimlaneById(this.boardLatest, swimlaneId)?.name;
    if (!swimlaneText) {
      return null;
    }

    const swimlaneHeader = [...document.querySelectorAll(DOM.swimlaneHeaderContainerCloud)].find(swimlaneElement => {
      return swimlaneElement.textContent === swimlaneText;
    });

    if (!swimlaneHeader) {
      return null;
    }

    const swimlaneContent = swimlaneHeader?.closest(DOM.swimlaneCloud);
    if (!swimlaneContent) {
      return null;
    }

    const index = this.boardLatest?.columns?.findIndex(column => {
      return String(column.id) === columnId;
    });
    const swimlaneColumn = [...swimlaneContent.querySelectorAll(DOM.swimlaneColumnCloud)]?.[index];
    return swimlaneColumn;
  }

  markCell(cell, range, issuesInCell) {
    const domElement = this.getSwimlaneColumn(cell.swimlane, cell.column);

    if (!domElement) {
      return;
    }

    if (!cell.notFoundOnBoard) {
      if (range.disable) {
        domElement.classList.add('WipLimitCells_disable');
      }

      if (issuesInCell > range.wipLimit) {
        domElement.classList.add('WipLimit_NotRespected');
        domElement.classList.remove('WipLimit_Respected');
      } else {
        domElement.classList.remove('WipLimit_NotRespected');
        domElement.classList.add('WipLimit_Respected');
      }

      let colorBadge;
      if (issuesInCell === range.wipLimit) {
        colorBadge = '#ffd700"';
      } else if (issuesInCell > range.wipLimit) {
        colorBadge = '#ff5630"';
      }

      if (cell.showBadge) {
        this.insertHTML(domElement, 'afterbegin', this.getGetRengeDOM(issuesInCell, range.wipLimit, colorBadge));
      }
    }
  }

  setBorderString(cell, matrixRange) {
    let borderString = '';

    if (cell.x !== 0) {
      if (matrixRange[cell.x - 1][cell.y] === 0) {
        borderString += 'T';
      }
    } else {
      borderString += 'T';
    }

    if (cell.x !== matrixRange.length - 1) {
      if (matrixRange[cell.x + 1][cell.y] === 0) {
        borderString += 'B';
      }
    } else {
      borderString += 'B';
    }

    if (cell.y !== 0) {
      if (matrixRange[cell.x][cell.y - 1] === 0) {
        borderString += 'L';
      }
    } else {
      borderString += 'L';
    }

    if (cell.y !== matrixRange[cell.x].length - 1) {
      if (matrixRange[cell.x][cell.y + 1] === 0) {
        borderString += 'R';
      }
    } else {
      borderString += 'R';
    }
    return borderString;
  }

  invertMatrix(ArrayOfCells, matrixRange, emptyMartix) {
    const matrixWithDom = this.arrayClone(emptyMartix);
    for (let s = 0; s < matrixRange.length; s++) {
      for (let c = 0; c < matrixRange[s].length; c++) {
        if (matrixRange[s][c] === 1) {
          matrixWithDom[s][c] = [ArrayOfCells[s][c]];
        }
      }
    }
    return matrixWithDom;
  }

  getEmptyMartix(matrixRange) {
    const emptyMartix = [];
    matrixRange.forEach(row => {
      const newRow = [];
      row.forEach(() => newRow.push(0));
      emptyMartix.push(newRow);
    });
    return emptyMartix;
  }

  arrayClone(arr) {
    let i;
    let copy;

    if (Array.isArray(arr)) {
      copy = arr.slice(0);
      for (i = 0; i < copy.length; i++) {
        copy[i] = this.arrayClone(copy[i]);
      }
      return copy;
    }

    return arr;
  }

  excludeCells(ArrayOfCells, matrixRange, cellsDOM) {
    const result = {
      s: null,
      c: null,
    };
    for (let s = 0; s < ArrayOfCells.length; s++) {
      for (let c = 0; c < ArrayOfCells[s].length; c++) {
        if (ArrayOfCells[s][c] === cellsDOM) {
          matrixRange[s][c] = 1;
          result.s = s;
          result.c = c;
          return result;
        }
      }
    }
    return result;
  }

  getCells() {
    const CellsArray = [];
    const rows = document.querySelectorAll('.ghx-swimlane');
    for (const row of rows) {
      const rowCells = [];
      const cells = row.querySelectorAll('.ghx-column');
      for (const cell of cells) {
        rowCells.push(cell);
      }
      CellsArray.push(rowCells);
    }

    return CellsArray;
  }

  cellAddClasses(cell, countIssues, wipLimit) {
    if (cell.border.indexOf('L') !== -1) {
      cell.DOM.classList.add('WipLimitCellsRange_left');
    }

    if (cell.border.indexOf('R') !== -1) {
      cell.DOM.classList.add('WipLimitCellsRange_right');
    }

    if (cell.border.indexOf('T') !== -1) {
      cell.DOM.classList.add('WipLimitCellsRange_top');
    }

    if (cell.border.indexOf('B') !== -1) {
      cell.DOM.classList.add('WipLimitCellsRange_bottom');
    }

    if (countIssues > wipLimit) {
      cell.DOM.style.backgroundColor = '#ff563070';
      cell.DOM.classList.add('WipLimit_NotRespected');
    } else {
      cell.DOM.classList.add('WipLimit_Respected');
    }
  }

  setTimeout(func, time) {
    const timeoutID = setTimeout(func, time);
    this.sideEffects.push(() => clearTimeout(timeoutID));
    return timeoutID;
  }

  getGetRengeDOM(issueCount, wipLimit, colorBadge = '#1b855c') {
    return `<div class="WipLimitCellsBadge field-issues-count " style = "background-color: ${colorBadge}">${issueCount}/${wipLimit}</div>`;
  }

  appendStyles() {
    return `
    <style type="text/css">
    .WipLimitCellsBadge{
      position: absolute;
      top: -2px;
      right: -6px;
      border-radius: 50%;
      background: grey;
      color: white;
      padding: 5px 2px;
      font-size: 12px;
      line-height: 12px;
      font-weight: 400;
      z-index:1;
    }

    .WipLimitCellsRange_left{
      border-left: 0.15rem #1663e5 dashed;
    }
    .WipLimitCellsRange_right{
      border-right: 0.15rem #1663e5 dashed;
    }
    .WipLimitCellsRange_all{
      border: 0.15rem #1663e5 ;
    }
    .WipLimitCellsRange_top{
      border-top: 0.15rem #1663e5 dashed;
    }
    .WipLimitCellsRange_bottom{
      border-bottom: 0.15rem #1663e5 dashed;
    }

    .WipLimit_NotRespected{
        background-color: #ff563070;
      }

      .WipLimitCells_disable{
        background: repeating-linear-gradient(
          45deg,
          rgb(160 160 160),
          rgb(180 180 180) 10px,
          rgb(200 200 200) 10px,
          rgb(220 220 220) 20px
        ) !important;

      }

    </style>`;
  }
}
