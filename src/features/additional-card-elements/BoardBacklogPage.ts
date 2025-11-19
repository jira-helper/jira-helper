import { BoardBacklogPagePageObject } from 'src/page-objects/BoardBacklogPage';
import { PageModification } from 'src/shared/PageModification';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';
import { loadAdditionalCardElementsBoardProperty } from './BoardSettings/actions/loadAdditionalCardElementsBoardProperty';

export class AdditionalCardElementsBoardBacklogPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `additional-card-elements-board-backlog-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardBacklogPagePageObject.selectors.backlogColumn);
  }

  loadData() {
    return loadAdditionalCardElementsBoardProperty();
  }

  async apply(): Promise<void> {
    const { AdditionalCardElementsBacklogContainer } = await import(
      './AdditionalCardElementsBacklogContainer/AdditionalCardElementsBacklogContainer'
    );
    const unlisten = BoardBacklogPagePageObject.listenCards(cards => {
      cards.forEach(card => {
        card.attach(AdditionalCardElementsBacklogContainer, 'additional-card-elements-backlog');
      });
    });
    this.sideEffects.push(unlisten);

    registerSettings({
      title: 'Additional Card Elements',
      component: AdditionalCardElementsSettings,
    });
  }
}
