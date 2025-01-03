import { PageModification } from '../shared/PageModification';
import { BOARD_PROPERTIES } from '../shared/constants';

interface Cell {
  column: string;
  showBadge: boolean;
  swimlane: string;
  DOM?: Element;
  x?: number;
  y?: number;
  notFoundOnBoard?: boolean;
  border?: string;
}

interface Range {
  cells: Cell[];
  wipLimit: number;
  disable: boolean;
  matrixRange?: any[];
}

export default class extends PageModification<any, Element> {
  private wip: Range[] = [];

  private counterCssSelector: string = '';

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  getModificationId(): string {
    return `SLAIndicatorTitle-shows-${this.getBoardId()}`;
  }

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  async loadData(): Promise<[any, Range[]]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS)]);
  }

  async apply(data: [any, Range[]]): Promise<void> {
    if (!data) return;
    const [editData, WipLimitSetting] = data;

    if (!WipLimitSetting) {
      return;
    }

    this.wip = WipLimitSetting;
    this.counterCssSelector = this.getCssSelectorOfIssues(editData);
    this.renderWipLimitCells();
    this.onDOMChange('#ghx-pool', () => this.renderWipLimitCells());
  }

  renderWipLimitCells(): void {
    const ArrayOfCells = this.getCells();
    const emptyMartix = this.getEmptyMartix(ArrayOfCells);
    for (const range of this.wip) {
      let countIssues = 0;

      const matrixRange = this.arrayClone(emptyMartix);
      for (const cell of range.cells) {
        const selector = `[swimlane-id='${cell.swimlane}'] [data-column-id='${cell.column}']`;
        const cellsDOM = document.querySelector(selector);
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
            (cell.DOM as HTMLElement).classList.add('WipLimitCells_disable');
          }

          cell.border = this.setBorderString(cell, range.matrixRange);
          this.cellAddClasses(cell, countIssues, range.wipLimit);

          if (cell.showBadge) {
            (cell.DOM as HTMLElement).insertAdjacentHTML(
              'afterbegin',
              this.getGetRengeDOM(countIssues, range.wipLimit, colorBadge)
            );
          }
        }
      }
    }
  }

  setBorderString(cell: Cell, matrixRange: any[]): string {
    let borderString = '';

    if (cell.x !== undefined && cell.x !== 0) {
      if (matrixRange[cell.x - 1][cell.y!] === 0) {
        borderString += 'T';
      }
    } else {
      borderString += 'T';
    }

    if (cell.x !== undefined && cell.x !== matrixRange.length - 1) {
      if (matrixRange[cell.x + 1][cell.y!] === 0) {
        borderString += 'B';
      }
    } else {
      borderString += 'B';
    }

    if (cell.y !== undefined && cell.y !== 0) {
      if (matrixRange[cell.x!][cell.y - 1] === 0) {
        borderString += 'L';
      }
    } else {
      borderString += 'L';
    }

    if (cell.y !== undefined && cell.y !== matrixRange[cell.x!].length - 1) {
      if (matrixRange[cell.x!][cell.y + 1] === 0) {
        borderString += 'R';
      }
    } else {
      borderString += 'R';
    }
    return borderString;
  }

  invertMatrix(ArrayOfCells: any[], matrixRange: any[], emptyMartix: any[]): any[] {
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

  getEmptyMartix(matrixRange: any[]): any[] {
    const emptyMartix: any[] = [];
    matrixRange.forEach(row => {
      const newRow: number[] = [];
      row.forEach(() => newRow.push(0));
      emptyMartix.push(newRow);
    });
    return emptyMartix;
  }

  arrayClone(arr: any[]): any[] {
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

  excludeCells(ArrayOfCells: any[], matrixRange: any[], cellsDOM: Element): { s: number; c: number } {
    const result = {
      s: 0,
      c: 0,
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

  getCells(): Element[][] {
    const CellsArray: Element[][] = [];
    const rows = Array.from(document.querySelectorAll('.ghx-swimlane'));
    for (const row of rows) {
      const rowCells: Element[] = [];
      const cells = Array.from(row.querySelectorAll('.ghx-column'));
      for (const cell of cells) {
        rowCells.push(cell);
      }
      CellsArray.push(rowCells);
    }

    return CellsArray;
  }

  cellAddClasses(cell: Cell, countIssues: number, wipLimit: number): void {
    if (cell.border?.indexOf('L') !== -1) {
      cell.DOM!.classList.add('WipLimitCellsRange_left');
    }

    if (cell.border?.indexOf('R') !== -1) {
      cell.DOM!.classList.add('WipLimitCellsRange_right');
    }

    if (cell.border?.indexOf('T') !== -1) {
      cell.DOM!.classList.add('WipLimitCellsRange_top');
    }

    if (cell.border?.indexOf('B') !== -1) {
      cell.DOM!.classList.add('WipLimitCellsRange_bottom');
    }

    if (countIssues > wipLimit) {
      (cell.DOM! as HTMLElement).style.backgroundColor = '#ff563070';
      cell.DOM!.classList.add('WipLimit_NotRespected');
    } else {
      cell.DOM!.classList.add('WipLimit_Respected');
    }
  }

  getGetRengeDOM(issueCount: number, wipLimit: number, colorBadge: string = '#1b855c'): string {
    return `<div class="WipLimitCellsBadge field-issues-count " style = "background-color: ${colorBadge}">${issueCount}/${wipLimit}</div>`;
  }

  appendStyles(): string {
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

    .WipLimitNotRespected{
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
