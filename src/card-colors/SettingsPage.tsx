import { createRoot } from 'react-dom/client';
import React from 'react';
import { globalContainer } from 'dioma';
import { getBoardProperty, updateBoardProperty } from 'src/shared/jiraApi';
import { PageModification } from '../shared/PageModification';
import { WithDi } from '../shared/diContext';
import { settingsPagePageObjectToken } from '../page-objects/SettingsPage';
import { routingServiceToken } from '../routing';
import { CardColorsSettingsContainer } from './CardColorsSettingsContainer';
import { PropertyValue } from './types';

export default class CardColorsSettingsPage extends PageModification<undefined, Element> {
  private get settingsPage() {
    return globalContainer.inject(settingsPagePageObjectToken);
  }

  getModificationId(): string {
    return `card-colors-settings-${this.getBoardId()}`;
  }

  async shouldApply(): Promise<boolean> {
    const tab = await globalContainer.inject(routingServiceToken).getSettingsTab();
    return tab === 'cardColors';
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(this.settingsPage.selectors.settingsContent);
  }

  async apply(): Promise<void> {
    const CardColorsSettings = this.settingsPage.getCardColorsSettingsTabPageObject();

    const el = CardColorsSettings.createSpaceBeforeColorsTable();
    if (!el) {
      // eslint-disable-next-line no-console
      console.error('Cant insert CardColors settings Component');
      return;
    }

    const boardId = this.getBoardId();
    if (!boardId) {
      return;
    }

    const updateProperty = (property: string, value: PropertyValue) => {
      updateBoardProperty(boardId, property, value);
    };

    const getProperty = (property: string): Promise<PropertyValue> => {
      return getBoardProperty(boardId, property);
    };

    createRoot(el).render(
      <WithDi container={globalContainer}>
        <CardColorsSettingsContainer updateBoardProperty={updateProperty} getBoardProperty={getProperty} />
      </WithDi>
    );
  }
}
