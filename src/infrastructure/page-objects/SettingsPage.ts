import { Container, Token } from 'dioma';
import { CardColorsSettingsTabPageObject } from './CardColorsSettingsTabPageObject';
import { SwimlaneLimitsSettingsTabPageObject } from './SwimlaneLimitsSettingsTabPageObject';
import { ColumnsSettingsTabPageObject } from './ColumnsSettingsTabPageObject';

export interface ISettingsPagePageObject {
  selectors: {
    settingsContent: string;
    selectedNav: string;
  };

  getSelectedTab(): string | null;
  getCardColorsSettingsTabPageObject(): CardColorsSettingsTabPageObject;
  getColumnsSettingsTabPageObject(): ColumnsSettingsTabPageObject;
  getSwimlaneLimitsSettingsTabPageObject(): SwimlaneLimitsSettingsTabPageObject;
  destroyColumnsSettingsTabPageObject(): void;
}

let columnsTab: ColumnsSettingsTabPageObject | null = null;

export const SettingsPagePageObject: ISettingsPagePageObject = {
  selectors: {
    settingsContent: '#main',
    selectedNav: '.aui-nav-selected',
  },

  getSelectedTab(): string | null {
    const selected = document.querySelector(this.selectors.selectedNav) as HTMLElement | null;
    return selected?.dataset?.tabitem ?? null;
  },

  getCardColorsSettingsTabPageObject() {
    return new CardColorsSettingsTabPageObject();
  },

  getColumnsSettingsTabPageObject() {
    if (!columnsTab) {
      columnsTab = new ColumnsSettingsTabPageObject();
    }
    return columnsTab;
  },

  getSwimlaneLimitsSettingsTabPageObject() {
    return new SwimlaneLimitsSettingsTabPageObject();
  },

  destroyColumnsSettingsTabPageObject() {
    columnsTab?.destroy();
    columnsTab = null;
  },
};

export const settingsPagePageObjectToken = new Token<ISettingsPagePageObject>('settingsPagePageObjectToken');

export const registerSettingsPagePageObjectInDI = (container: Container) => {
  container.register({ token: settingsPagePageObjectToken, value: SettingsPagePageObject });
};
