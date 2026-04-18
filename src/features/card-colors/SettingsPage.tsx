import { createRoot } from 'react-dom/client';
import React from 'react';
import { Token } from 'dioma';
import { getBoardPropertyToken, updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { PageModification } from '../../shared/PageModification';
import { WithDi } from '../../shared/diContext';
import { settingsPagePageObjectToken } from '../../page-objects/SettingsPage';
import { CardColorsSettingsContainer } from './CardColorsSettingsContainer';
import { PropertyValue } from './types';

export default class CardColorsSettingsPage extends PageModification<undefined, Element> {
  private get settingsPage() {
    return this.container.inject(settingsPagePageObjectToken);
  }

  getModificationId(): string {
    return `card-colors-settings-${this.getBoardId()}`;
  }

  async shouldApply(): Promise<boolean> {
    return (await this.getSettingsTab()) === 'cardColors';
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
      this.container.inject(updateBoardPropertyToken)(boardId, property, value);
    };

    const getProperty = (property: string): Promise<PropertyValue> => {
      return this.container.inject(getBoardPropertyToken)(boardId, property);
    };

    createRoot(el).render(
      <WithDi container={this.container}>
        <CardColorsSettingsContainer updateBoardProperty={updateProperty} getBoardProperty={getProperty} />
      </WithDi>
    );
  }
}

export const cardColorsSettingsPageToken = new Token<CardColorsSettingsPage>('CardColorsSettingsPage');
