import { globalContainer } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { mergeSwimlaneSettings } from '../../swimlane/utils';
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

interface SwimlanesSettings {
  [key: string]: {
    ignoreWipInColumns: boolean;
  };
}

export default class extends PageModification<[EditData?, BoardGroup?, SwimlanesSettings?], Element> {
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

  loadData(): Promise<[EditData, BoardGroup, SwimlanesSettings]> {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS),
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
    ]);
  }

  apply(data: [EditData?, BoardGroup?, SwimlanesSettings?]): void {
    if (!data) return;
    const [editData = { rapidListConfig: { mappedColumns: [] } }, boardGroups = {}, swimlanesSettings = {}] = data;

    if (Object.keys(boardGroups).length === 0) return;

    // Register PageObject in DI
    try {
      globalContainer.inject(columnLimitsBoardPageObjectToken);
    } catch {
      registerColumnLimitsBoardPageObjectInDI(globalContainer);
    }

    // Initialize property store with loaded data
    const propertyStore = useColumnLimitsPropertyStore.getState();
    propertyStore.actions.setData(boardGroups);

    // Initialize runtime store
    const { actions } = useColumnLimitsRuntimeStore.getState();
    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    actions.setCssNotIssueSubTask(cssNotIssueSubTask);

    const ignoredSwimlanes = Object.keys(swimlanesSettings).filter(id => swimlanesSettings[id].ignoreWipInColumns);
    actions.setIgnoredSwimlanes(ignoredSwimlanes);

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
