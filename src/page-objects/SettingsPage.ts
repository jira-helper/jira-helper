import { getSettingsTab } from '../routing';
import { CardColorsSettingsTabPageObject } from './CardColorsSettingsTabPageObject';
import { SwimlaneLimitsSettingsTabPageObject } from './SwimlaneLimitsSettingsTabPageObject';

type SettingsTabs = 'cardColors' | 'swimlanes';

/**
 * PageObject for SettingsPage
 */
class SettingsPage {
  private static instance: SettingsPage;

  public static selectors = {
    settingsContent: '#main',
  };

  constructor() {
    if (SettingsPage.instance) {
      return SettingsPage.instance;
    }
    SettingsPage.instance = this;
  }

  public static getInstance(): SettingsPage {
    if (!SettingsPage.instance) {
      SettingsPage.instance = new SettingsPage();
    }
    return SettingsPage.instance;
  }

  public static async getSettingsTab(): Promise<SettingsTabs> {
    const result = await getSettingsTab();
    if (!result) {
      // TODO: no merge
      // eslint-disable-next-line no-console
      console.log('no result??');
      throw new Error('kek');
    }

    return result as SettingsTabs;
  }

  public static getCardColorsSettingsTabPageObject() {
    return new CardColorsSettingsTabPageObject();
  }

  public static getSwimlaneLimitsSettingsTabPageObject() {
    return new SwimlaneLimitsSettingsTabPageObject();
  }
}

export { SettingsPage };
