import { createRoot } from 'react-dom/client';
import React from 'react';
import { getBoardProperty, updateBoardProperty } from 'src/shared/jiraApi';
import { PageModification } from '../shared/PageModification';
import { SettingsPage } from '../page-objects/SettingsPage';
import { CardColorsSettingsContainer } from './CardColorsSettingsContainer';
import { PropertyValue } from './types';

export default class CardColorsSettingsPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `card-colors-settings-${this.getBoardId()}`;
  }

  async shouldApply(): Promise<boolean> {
    const tab = await SettingsPage.getSettingsTab();
    if (tab === 'cardColors') {
      return true;
    }
    return false;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(SettingsPage.selectors.settingsContent);
  }

  async apply(): Promise<void> {
    const CardColorsSettings = SettingsPage.getCardColorsSettingsTabPageObject();

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
      <CardColorsSettingsContainer updateBoardProperty={updateProperty} getBoardProperty={getProperty} />
    );
  }
}
