import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { PageModification } from 'src/shared/PageModification';
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
      title: 'Local Settings',
      component: LocalSettingsTab,
    });
  }
}
