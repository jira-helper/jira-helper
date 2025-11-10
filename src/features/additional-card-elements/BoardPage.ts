import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { PageModification } from 'src/shared/PageModification';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';
import { loadAdditionalCardElementsBoardProperty } from './BoardSettings/actions/loadAdditionalCardElementsBoardProperty';
import { autosyncStoreWithBoardProperty } from './BoardSettings/actions/autosyncStoreWithBoardProperty';

export class AdditionalCardElementsBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `additional-card-elements-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return loadAdditionalCardElementsBoardProperty();
  }

  async apply(): Promise<void> {
    const turnOffAutoSync = await autosyncStoreWithBoardProperty();
    this.sideEffects.push(turnOffAutoSync);

    const { AdditionalCardElementsContainer } = await import(
      './AdditionalCardElementsContainer/AdditionalCardElementsContainer'
    );
    const unlisten = BoardPagePageObject.listenCards(cards => {
      cards.forEach(card => {
        card.attach(AdditionalCardElementsContainer, 'additional-card-elements', {
          position: 'aftersummary',
        });
      });
    });
    this.sideEffects.push(unlisten);

    registerSettings({
      title: 'Additional Card Elements',
      component: AdditionalCardElementsSettings,
    });
  }
}
