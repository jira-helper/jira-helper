import { createRoot } from 'react-dom/client';
import React from 'react';
import { PageModification } from '../shared/PageModification';
import { SettingsPage } from '../page-objects/SettingsPage';
import { ColorCardSettingsComponent } from './CardColorsSettingsComponent';

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

    createRoot(el).render(<ColorCardSettingsComponent />);
  }
}
