import { Token } from 'dioma';
import { BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';

import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BOARD_SETTINGS_TAB_IDS } from 'src/features/board-settings/settingsTabIds';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { loadLocalSettings } from './actions/loadLocalSettings';
import { LocalSettingsTab } from './components/LocalSettingsTab';

export class LocalSettingsBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `local-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return loadLocalSettings();
  }

  async apply(): Promise<void> {
    registerSettings({
      id: BOARD_SETTINGS_TAB_IDS.LOCAL_SETTINGS,
      title: 'Local Settings',
      component: LocalSettingsTab,
    });
  }
}

export const localSettingsBoardPageToken = new Token<LocalSettingsBoardPage>('LocalSettingsBoardPage');
