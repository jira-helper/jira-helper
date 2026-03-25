import React from 'react';
import { globalContainer } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { routingServiceToken } from '../../routing';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { WithDi } from '../../shared/diContext';
import { useColumnLimitsPropertyStore } from '../property/store';
import { SettingsButtonContainer } from './components/SettingsButton';
import { settingsPagePageObjectToken } from '../../page-objects/SettingsPage';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnHeaderName: '.ghx-header-name',
  };

  async shouldApply(): Promise<boolean> {
    return (await globalContainer.inject(routingServiceToken).getSettingsTab()) === 'columns';
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

    useColumnLimitsPropertyStore.getState().actions.setData(wipLimits);
    useColumnLimitsPropertyStore.getState().actions.setState('loaded');

    const rawSwimlanes =
      (boardData as { swimlanesConfig?: { swimlanes?: Array<{ id?: string; name: string }> } }).swimlanesConfig
        ?.swimlanes ?? [];
    this.boardSwimlanes = rawSwimlanes.map((swim, index) => ({
      id: String((swim as { id?: string }).id ?? swim.name ?? `swimlane-${index}`),
      name: swim.name,
    }));

    const pageObject = globalContainer.inject(settingsPagePageObjectToken).getColumnsSettingsTabPageObject();

    const cleanup = pageObject.registerButton(
      'column-limits',
      React.createElement(WithDi, {
        container: globalContainer,
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
