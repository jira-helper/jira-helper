import { getSettingsTab } from '../routing';
import { CardColorsSettingsTabPageObject } from './CardColorsSettingsTabPageObject';
import { SwimlaneLimitsSettingsTabPageObject } from './SwimlaneLimitsSettingsTabPageObject';
import { ColumnsSettingsTabPageObject } from './ColumnsSettingsTabPageObject';

type SettingsTabs = 'cardColors' | 'swimlanes' | 'columns';

/**
 * PageObject for SettingsPage
 */
class SettingsPage {
  private static instance: SettingsPage;
  private static columnsTab: ColumnsSettingsTabPageObject | null = null;

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
      throw new Error('Cannot determine settings tab');
    }

    return result as SettingsTabs;
  }

  public static getCardColorsSettingsTabPageObject() {
    return new CardColorsSettingsTabPageObject();
  }

  public static getSwimlaneLimitsSettingsTabPageObject() {
    return new SwimlaneLimitsSettingsTabPageObject();
  }

  /**
   * Get singleton PageObject for Columns tab.
   * Used by column-limits, person-limits, wip-on-cells features.
   */
  public static getColumnsSettingsTabPageObject(): ColumnsSettingsTabPageObject {
    if (!this.columnsTab) {
      this.columnsTab = new ColumnsSettingsTabPageObject();
    }
    return this.columnsTab;
  }

  /**
   * Destroy Columns tab PageObject (call when navigating away from settings).
   */
  public static destroyColumnsSettingsTabPageObject(): void {
    this.columnsTab?.destroy();
    this.columnsTab = null;
  }
}

export { SettingsPage };
