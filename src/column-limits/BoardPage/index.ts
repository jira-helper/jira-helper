import { Token } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import type { WipLimitsProperty } from '../types';
import { boardRuntimeModelToken, propertyModelToken } from '../tokens';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';
import type { PropertyModel } from '../property/PropertyModel';

interface EditData {
  rapidListConfig: {
    mappedColumns: Array<{
      id: string;
      isKanPlanColumn: boolean;
      max?: number;
    }>;
  };
}

export default class ColumnLimitsBoardPage extends PageModification<[EditData?, WipLimitsProperty?], Element> {
  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `add-wip-limits-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-column-header-group');
  }

  async loadData(): Promise<[EditData, WipLimitsProperty]> {
    const editData = await this.getBoardEditData();
    const boardProperty = await this.getBoardProperty<WipLimitsProperty>(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS);
    return [editData, boardProperty ?? {}];
  }

  apply(data: [EditData?, WipLimitsProperty?]): void {
    if (!data) return;
    const [editData = { rapidListConfig: { mappedColumns: [] } }, boardGroups = {}] = data;

    if (Object.keys(boardGroups).length === 0) return;

    const { model: propertyModel } = this.container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = this.container.inject(boardRuntimeModelToken);

    (propertyModel as PropertyModel).setData(boardGroups);

    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    (boardRuntimeModel as BoardRuntimeModel).setCssNotIssueSubTask(cssNotIssueSubTask);

    const headerGroup = document.querySelector<HTMLElement>('#ghx-pool-wrapper');
    if (headerGroup) {
      headerGroup.style.paddingTop = '10px';
    }

    (boardRuntimeModel as BoardRuntimeModel).apply();

    this.onDOMChange('#ghx-pool', () => {
      (boardRuntimeModel as BoardRuntimeModel).apply();
    });
  }
}

export const columnLimitsBoardPageToken = new Token<ColumnLimitsBoardPage>('ColumnLimitsBoardPage');
