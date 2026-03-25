import React from 'react';
import { globalContainer } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { routingServiceToken } from '../../routing';
import { WithDi } from '../../shared/diContext';
import { loadPersonWipLimitsProperty } from '../property';
import { searchUsers } from '../../shared/jiraApi';
import { SettingsButtonContainer } from './components/SettingsButton';
import { settingsPagePageObjectToken } from '../../page-objects/SettingsPage';
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
    columnsConfig: '#ghx-config-columns',
  };

  private boardData: BoardData | null = null;
  private boardDataColumns: MappedColumn[] | null = null;
  private boardDataSwimlanes: Swimlane[] | null = null;

  async shouldApply(): Promise<boolean> {
    return (await globalContainer.inject(routingServiceToken).getSettingsTab()) === 'columns';
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

    const columns: Column[] = (this.boardDataColumns || []).map(col => ({
      id: col.id,
      name: col.name,
    }));

    const swimlanes: Swimlane[] = (this.boardDataSwimlanes || []).map(swim => ({
      id: (swim as any).id,
      name: swim.name,
    }));

    const pageObject = globalContainer.inject(settingsPagePageObjectToken).getColumnsSettingsTabPageObject();

    const cleanup = pageObject.registerButton(
      'person-limits',
      React.createElement(WithDi, {
        container: globalContainer,
        children: React.createElement(SettingsButtonContainer, {
          boardDataColumns: columns,
          boardDataSwimlanes: swimlanes,
          searchUsers,
        }),
      })
    );

    this.sideEffects.push(cleanup);
  }
}
