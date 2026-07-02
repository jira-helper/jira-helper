import { BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';

import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BOARD_SETTINGS_TAB_IDS } from 'src/features/board-settings/settingsTabIds';
import { PageModification } from '../../infrastructure/page-modification/PageModification';

import { DiagnosticSettingsTabContent } from './SettingsTab';

export class DiagnosticBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `diagnostic-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    // No specific data loading needed for diagnostic
    return Promise.resolve();
  }

  async apply(): Promise<void> {
    registerSettings({
      id: BOARD_SETTINGS_TAB_IDS.DIAGNOSTIC,
      title: 'Diagnostic',
      component: DiagnosticSettingsTabContent,
    });
  }
}
