import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { PageModification } from 'src/shared/PageModification';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';

export class AdditionalCardElementsBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `additional-card-elements-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    // TODO: Implement card elements display
    registerSettings({
      title: 'Additional Card Elements',
      component: AdditionalCardElementsSettings,
    });
  }
}
