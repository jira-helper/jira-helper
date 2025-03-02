import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { PageModification } from '../../shared/PageModification';

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
      title: 'Diagnostic',
      component: DiagnosticSettingsTabContent,
    });
  }
}
