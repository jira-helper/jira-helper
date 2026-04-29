import { Token } from 'dioma';
import { BoardBacklogPagePageObject } from 'src/infrastructure/page-objects/BoardBacklogPage';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';

import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { AdditionalCardElementsSettings } from './BoardSettings/AdditionalCardElementsSettings';
import { loadAdditionalCardElementsBoardProperty } from './BoardSettings/actions/loadAdditionalCardElementsBoardProperty';
import { useAdditionalCardElementsBoardPropertyStore } from './stores/additionalCardElementsBoardProperty';
import { linkifyEpicLinkBadges, unlinkifyEpicLinkBadges } from './utils/linkifyEpicLinkBadges';

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
    let { clickableEpicLinks } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    const applyEpicLinkClickability = (enabled: boolean) => {
      document.querySelectorAll(BoardBacklogPagePageObject.selectors.backlogIssueCard).forEach(card => {
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

    const unlisten = BoardBacklogPagePageObject.listenCards(cards => {
      cards.forEach(card => {
        const currentSettings = useAdditionalCardElementsBoardPropertyStore.getState().data;
        if (currentSettings.clickableEpicLinks) {
          linkifyEpicLinkBadges(card.getCardElement());
        }
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

export const additionalCardElementsBoardBacklogPageToken = new Token<AdditionalCardElementsBoardBacklogPage>(
  'AdditionalCardElementsBoardBacklogPage'
);
