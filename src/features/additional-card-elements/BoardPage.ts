import { Token } from 'dioma';
import { BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';

import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';
import { loadAdditionalCardElementsBoardProperty } from './BoardSettings/actions/loadAdditionalCardElementsBoardProperty';
import { autosyncStoreWithBoardProperty } from './BoardSettings/actions/autosyncStoreWithBoardProperty';
import { IssueLinkBadgesContainer } from './IssueLinkBadgesContainer/IssueLinkBadgesContainer';
import { CardStatusBadgesContainer } from './CardStatusBadgesContainer/CardStatusBadgesContainer';
import { IssueConditionCheckContainer } from './IssueConditionCheck/IssueConditionCheckContainer';
import { linkifyEpicLinkBadges, unlinkifyEpicLinkBadges } from './utils/linkifyEpicLinkBadges';

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
    let { clickableEpicLinks } = store.data;
    const applyEpicLinkClickability = (enabled: boolean) => {
      document.querySelectorAll(BoardPagePageObject.selectors.issue).forEach(card => {
        if (enabled) {
          linkifyEpicLinkBadges(card);
        } else {
          unlinkifyEpicLinkBadges(card);
        }
      });
    };
    const unsubscribeClickableEpicLinks = useAdditionalCardElementsBoardPropertyStore.subscribe(state => {
      if (state.data.clickableEpicLinks === clickableEpicLinks) {
        return;
      }

      clickableEpicLinks = state.data.clickableEpicLinks;
      applyEpicLinkClickability(clickableEpicLinks);
    });
    this.sideEffects.push(unsubscribeClickableEpicLinks);

    const unlisten = BoardPagePageObject.listenCards(cards => {
      cards.forEach(card => {
        const currentSettings = useAdditionalCardElementsBoardPropertyStore.getState().data;
        if (currentSettings.clickableEpicLinks) {
          linkifyEpicLinkBadges(card.getCardElement());
        }
        // Issue link badges - after summary
        card.attach(IssueLinkBadgesContainer, 'issue-link-badges', {
          position: 'aftersummary',
        });
        // Days in column & deadline badges - at the end of card
        card.attach(CardStatusBadgesContainer, 'card-status-badges', {
          position: 'beforeend',
        });
        // Condition check badges - in footer before days counter
        card.attach(IssueConditionCheckContainer, 'condition-check-badges', {
          position: 'inFooterBeforeDays',
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

export const additionalCardElementsBoardPageToken = new Token<AdditionalCardElementsBoardPage>(
  'AdditionalCardElementsBoardPage'
);
