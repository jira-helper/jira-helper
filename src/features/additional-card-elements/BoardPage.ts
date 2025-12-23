import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { PageModification } from 'src/shared/PageModification';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';
import { loadAdditionalCardElementsBoardProperty } from './BoardSettings/actions/loadAdditionalCardElementsBoardProperty';
import { autosyncStoreWithBoardProperty } from './BoardSettings/actions/autosyncStoreWithBoardProperty';
import { IssueLinkBadgesContainer } from './IssueLinkBadgesContainer/IssueLinkBadgesContainer';
import { CardStatusBadgesContainer } from './CardStatusBadgesContainer/CardStatusBadgesContainer';

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

    // Check if Days in Column feature is enabled and hide default Jira counter
    const { useAdditionalCardElementsBoardPropertyStore } = await import(
      './stores/additionalCardElementsBoardProperty'
    );
    const store = useAdditionalCardElementsBoardPropertyStore.getState();
    if (store.data.enabled && store.data.daysInColumn?.enabled) {
      BoardPagePageObject.hideDaysInColumn();
    }

    const unlisten = BoardPagePageObject.listenCards(cards => {
      cards.forEach(card => {
        // Issue link badges - after summary
        card.attach(IssueLinkBadgesContainer, 'issue-link-badges', {
          position: 'aftersummary',
        });
        // Days in column & deadline badges - at the end of card
        card.attach(CardStatusBadgesContainer, 'card-status-badges', {
          position: 'beforeend',
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
