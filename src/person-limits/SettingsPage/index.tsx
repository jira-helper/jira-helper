import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { getOrCreateButtonsContainer } from '../../shared/settingsPageButtonsContainer';
import { loadPersonWipLimitsProperty } from '../property';
import { searchUsers } from '../../shared/jiraApi';
import { SettingsButtonContainer } from './components/SettingsButton';
import type { Column, Swimlane } from './state/types';

type MappedColumn = {
  id: string;
  isKanPlanColumn: boolean;
  max?: number;
  name: string;
};
type BoardSwimlane = {
  name: string;
};
type BoardData = {
  rapidListConfig: {
    mappedColumns: MappedColumn[];
  };
  swimlanesConfig: {
    swimlanes: BoardSwimlane[];
  };
  canEdit: boolean;
};

export default class PersonalWIPLimit extends PageModification<[BoardData], Element> {
  static jiraSelectors = {
    /** Jira columns config container */
    columnsConfig: '#ghx-config-columns',
    /** Last child in columns config - insert button before it */
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
  };

  private boardData: BoardData | null = null;

  private boardDataColumns: MappedColumn[] | null = null;

  private boardDataSwimlanes: Swimlane[] | null = null;

  private settingsButtonRoot: Root | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-person-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(PersonalWIPLimit.jiraSelectors.columnsConfig);
  }

  async loadData(): Promise<[BoardData]> {
    await loadPersonWipLimitsProperty();
    const boardData = await this.getBoardEditData();
    return [boardData];
  }

  apply(data: [BoardData]): void {
    if (!data) return;
    const [boardData] = data;
    if (!boardData.canEdit) return;

    this.boardData = boardData;
    this.boardDataColumns = this.boardData.rapidListConfig.mappedColumns.filter((i: any) => !i.isKanPlanColumn);
    this.boardDataSwimlanes = this.boardData.swimlanesConfig.swimlanes;

    this.renderEditButton();
  }

  renderEditButton(): void {
    const sharedContainer = getOrCreateButtonsContainer();
    const buttonContainer = document.createElement('div');
    sharedContainer.appendChild(buttonContainer);

    const columns: Column[] = (this.boardDataColumns || []).map(col => ({
      id: col.id,
      name: col.name,
    }));

    const swimlanes: Swimlane[] = (this.boardDataSwimlanes || []).map(swim => ({
      id: (swim as any).id,
      name: swim.name,
    }));

    this.settingsButtonRoot = createRoot(buttonContainer);
    this.settingsButtonRoot.render(
      React.createElement(SettingsButtonContainer, {
        boardDataColumns: columns,
        boardDataSwimlanes: swimlanes,
        searchUsers,
      })
    );
  }
}
