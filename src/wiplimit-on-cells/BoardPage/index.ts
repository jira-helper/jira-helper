import { globalContainer } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import type { WipLimitRange } from '../types';
import { useWipLimitCellsRuntimeStore } from './stores';
import { registerWipLimitCellsBoardPageObjectInDI, wipLimitCellsBoardPageObjectToken } from './pageObject';
import { renderWipLimitCells } from './actions/renderWipLimitCells';

/**
 * BoardPage modification for WipLimitOnCells feature.
 *
 * Displays WIP limit ranges on board cells with visual indicators:
 * - Borders around cell ranges
 * - Badges with issue count / limit
 * - Background color when limit is exceeded
 */
export default class WipLimitOnCellsBoard extends PageModification<[any, WipLimitRange[]], Element> {
  getModificationId(): string {
    return `WipLimitOnCells-board-${this.getBoardId()}`;
  }

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async loadData(): Promise<[any, WipLimitRange[]]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS)]);
  }

  apply(data: [any, WipLimitRange[]]): void {
    if (!data) return;
    const [editData, settings] = data;
    if (!settings?.length) return;

    // Register PageObject in DI
    try {
      globalContainer.inject(wipLimitCellsBoardPageObjectToken);
    } catch {
      registerWipLimitCellsBoardPageObjectInDI(globalContainer);
    }
    const pageObject = globalContainer.inject(wipLimitCellsBoardPageObjectToken);

    // Set CSS selector in runtime store
    const cssSelectorOfIssues = this.getCssSelectorOfIssues(editData);
    useWipLimitCellsRuntimeStore.getState().actions.setCssSelectorOfIssues(cssSelectorOfIssues);

    // Initial render
    renderWipLimitCells(settings, pageObject, cssSelectorOfIssues, this.shouldCountIssue.bind(this));

    // Re-render on DOM changes
    this.onDOMChange('#ghx-pool', () => {
      renderWipLimitCells(settings, pageObject, cssSelectorOfIssues, this.shouldCountIssue.bind(this));
    });
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
