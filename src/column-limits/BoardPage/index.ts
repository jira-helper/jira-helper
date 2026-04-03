import { Token } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { useColumnLimitsPropertyStore } from '../property';
import { useColumnLimitsRuntimeStore } from './stores';
import { applyLimits } from './actions';
import { columnLimitsBoardPageObjectToken, registerColumnLimitsBoardPageObjectInDI } from './pageObject';

interface EditData {
  rapidListConfig: {
    mappedColumns: Array<{
      id: string;
      isKanPlanColumn: boolean;
      max?: number;
    }>;
  };
}

interface BoardGroup {
  [key: string]: {
    columns: string[];
    max?: number;
    customHexColor?: string;
    name: string;
    value: string;
    includedIssueTypes?: string[];
  };
}

export default class ColumnLimitsBoardPage extends PageModification<[EditData?, BoardGroup?], Element> {
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

  loadData(): Promise<[EditData, BoardGroup]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)]);
  }

  apply(data: [EditData?, BoardGroup?]): void {
    if (!data) return;
    const [editData = { rapidListConfig: { mappedColumns: [] } }, boardGroups = {}] = data;

    if (Object.keys(boardGroups).length === 0) return;

    // Register PageObject in DI
    try {
      this.container.inject(columnLimitsBoardPageObjectToken);
    } catch {
      registerColumnLimitsBoardPageObjectInDI(this.container);
    }

    // Initialize property store with loaded data
    const propertyStore = useColumnLimitsPropertyStore.getState();
    propertyStore.actions.setData(boardGroups);

    // Initialize runtime store
    const { actions } = useColumnLimitsRuntimeStore.getState();
    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    actions.setCssNotIssueSubTask(cssNotIssueSubTask);

    // Adjust header padding for Jira v8
    const headerGroup = document.querySelector<HTMLElement>('#ghx-pool-wrapper');
    if (headerGroup) {
      headerGroup.style.paddingTop = '10px';
    }

    // Apply limits
    applyLimits();

    // Watch for DOM changes
    this.onDOMChange('#ghx-pool', () => {
      applyLimits();
    });
  }
}

export const columnLimitsBoardPageToken = new Token<ColumnLimitsBoardPage>('ColumnLimitsBoardPage');
