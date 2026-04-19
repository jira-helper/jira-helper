import React from 'react';
import { Token } from 'dioma';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { BOARD_PROPERTIES } from '../../../shared/constants';
import { WithDi } from '../../../infrastructure/di/diContext';
import { propertyModelToken } from '../tokens';
import { SettingsButtonContainer } from './components/SettingsButton';
import { settingsPagePageObjectToken } from 'src/infrastructure/page-objects/SettingsPage';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnHeaderName: '.ghx-header-name',
  };

  async shouldApply(): Promise<boolean> {
    return (await this.getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-wip-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#ghx-config-columns');
  }

  loadData(): Promise<[any, any]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)]);
  }

  private boardSwimlanes: Array<{ id: string; name: string }> = [];

  apply(data: [any, any] | undefined): void {
    if (!data) return;
    const [boardData = {}, wipLimits = {}] = data;
    if (!boardData.canEdit) return;

    const { model: propertyModel } = this.container.inject(propertyModelToken);
    propertyModel.setData(wipLimits);

    const rawSwimlanes =
      (boardData as { swimlanesConfig?: { swimlanes?: Array<{ id?: string; name: string }> } }).swimlanesConfig
        ?.swimlanes ?? [];
    this.boardSwimlanes = rawSwimlanes.map((swim, index) => ({
      id: String((swim as { id?: string }).id ?? swim.name ?? `swimlane-${index}`),
      name: swim.name,
    }));

    const pageObject = this.container.inject(settingsPagePageObjectToken).getColumnsSettingsTabPageObject();

    const cleanup = pageObject.registerButton(
      'column-limits',
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(SettingsButtonContainer, {
          getColumns: () => this.getColumns(),
          getColumnName: (el: HTMLElement) => this.getColumnName(el),
          swimlanes: this.boardSwimlanes,
        }),
      })
    );

    this.sideEffects.push(cleanup);
  }

  getColumns(): NodeListOf<Element> {
    let allColumns = document.querySelector(SettingsWIPLimits.jiraSelectors.ulColumnsWrapper)
      ? document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumns)
      : document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsInner);

    if (!allColumns || allColumns.length === 0) {
      allColumns = document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsJira7);
    }

    return allColumns;
  }

  private getColumnName(el: HTMLElement): string {
    return el.querySelector(SettingsWIPLimits.jiraSelectors.columnHeaderName)?.getAttribute('title') ?? '';
  }
}

export const columnLimitsSettingsPageToken = new Token<SettingsWIPLimits>('SettingsWIPLimits');
