import React from 'react';
import { Token } from 'dioma';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { WithDi } from '../../../infrastructure/di/diContext';
import { propertyModelToken } from '../tokens';
import { searchUsersToken } from '../../../infrastructure/di/jiraApiTokens';
import { SettingsButtonContainer } from './components/SettingsButton';
import { settingsPagePageObjectToken } from 'src/infrastructure/page-objects/SettingsPage';
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
    swimlaneStrategy?: string;
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
    return (await this.getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-person-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(PersonalWIPLimit.jiraSelectors.columnsConfig);
  }

  async loadData(): Promise<[BoardData]> {
    const { model: propertyModel } = this.container.inject(propertyModelToken);
    await propertyModel.load();
    const boardData = await this.getBoardEditData();
    return [boardData];
  }

  apply(data: [BoardData]): void {
    if (!data) return;
    const [boardData] = data;
    // Render the person-limits button on the columns settings tab regardless of
    // `canEdit`: read-only users can still open the config and tweak it locally.
    // Persistence will fail silently for them; that's acceptable until we surface
    // a proper toaster.
    this.boardData = boardData;
    this.boardDataColumns = this.boardData.rapidListConfig.mappedColumns.filter((i: any) => !i.isKanPlanColumn);
    // Jira's editmodel returns saved query swimlanes regardless of the active strategy.
    // Only treat them as real swimlanes when the board uses the "custom" (Queries) strategy;
    // otherwise the saved entries are inert and would only confuse the user / break matching.
    const isCustomSwimlaneStrategy = this.boardData.swimlanesConfig?.swimlaneStrategy === 'custom';
    this.boardDataSwimlanes = isCustomSwimlaneStrategy ? this.boardData.swimlanesConfig.swimlanes : [];

    const columns: Column[] = (this.boardDataColumns || []).map(col => ({
      id: col.id,
      name: col.name,
    }));

    const swimlanes: Swimlane[] = (this.boardDataSwimlanes || []).map(swim => ({
      id: (swim as any).id,
      name: swim.name,
    }));

    const pageObject = this.container.inject(settingsPagePageObjectToken).getColumnsSettingsTabPageObject();

    const cleanup = pageObject.registerButton(
      'person-limits',
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(SettingsButtonContainer, {
          boardDataColumns: columns,
          boardDataSwimlanes: swimlanes,
          searchUsers: this.container.inject(searchUsersToken),
        }),
      })
    );

    this.sideEffects.push(cleanup);
  }
}

export const personLimitsSettingsPageToken = new Token<PersonalWIPLimit>('PersonalWIPLimit');
