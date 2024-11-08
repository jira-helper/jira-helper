import { mount } from 'svelte';
import { PageModification } from '../shared/PageModification';
import { SettingsPage } from '../page-objects/SettingsPage';
import CardColorsSettingsComponent from './CardColorsSettingsComponent.svelte';

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
    console.log('kek');
    const CardColorsSettings = SettingsPage.getCardColorsSettingsTabPageObject();
    // id="ghx-card-color-table-form"
    const el = CardColorsSettings.createSpaceBeforeColorsTable();
    if (!el) {
      console.error('Cant insert CardColors settings Component');
      return;
    }

    mount(CardColorsSettingsComponent, { target: el });
    //     const settingsPage = SettingsPage.getInstance();
    //     const checkbox = settingsPage.getFillWholeCardCheckbox();
    //     checkbox.addEventListener('change', () => {
    //       const isChecked = checkbox.checked;
    //       localStorage.setItem('fillWholeCard', JSON.stringify(isChecked));
    //     });
    //     const isChecked = JSON.parse(localStorage.getItem('fillWholeCard') || 'false');
    //     checkbox.checked = isChecked;
  }
}
