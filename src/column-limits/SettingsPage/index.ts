import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { getOrCreateButtonsContainer } from '../../shared/settingsPageButtonsContainer';
import { useColumnLimitsPropertyStore } from '../property/store';
import { SettingsButtonContainer } from './components/SettingsButton';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
    columnHeaderName: '.ghx-header-name',
  };

  private settingsButtonRoot: Root | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
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

  apply(data: [any, any] | undefined): void {
    if (!data) return;
    const [boardData = {}, wipLimits = {}] = data;
    if (!boardData.canEdit) return;

    useColumnLimitsPropertyStore.getState().actions.setData(wipLimits);
    useColumnLimitsPropertyStore.getState().actions.setState('loaded');

    this.renderSettingsButton();
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

  renderSettingsButton(): void {
    const sharedContainer = getOrCreateButtonsContainer();
    const buttonContainer = document.createElement('div');
    sharedContainer.appendChild(buttonContainer);

    this.settingsButtonRoot = createRoot(buttonContainer);
    this.settingsButtonRoot.render(
      React.createElement(SettingsButtonContainer, {
        getColumns: () => this.getColumns(),
        getColumnName: (el: HTMLElement) => this.getColumnName(el),
      })
    );
  }
}
