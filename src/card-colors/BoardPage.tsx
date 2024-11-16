import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { onDOMChange } from 'src/shared/domUtils';
import { getBoardProperty } from 'src/shared/jiraApi';
import { PageModification } from '../shared/PageModification';
import { processCard } from './processCard';

const excludeColors = {
  jiraHelperWIP: 'rgb(255, 86, 48)',
};

export class CardColorsBoardPage extends PageModification<undefined, Element> {
  private processedAttribute = 'jh-card-colors-processed';

  getModificationId(): string {
    return `card-colors-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    const cardColorsEnabled = await this.getCardColorsEnabled();
    if (!cardColorsEnabled) {
      return;
    }

    this.fillCardWithColor();

    const interval = setInterval(() => {
      this.processCards();
    }, 200);
    this.sideEffects.push(() => clearInterval(interval));

    const pool = document.querySelector(BoardPagePageObject.selectors.pool);
    if (!pool) {
      // eslint-disable-next-line no-console
      console.error('Pool not found');
      return;
    }

    const clear = onDOMChange(pool, () => {
      this.fillCardWithColor();
    });
    this.sideEffects.push(clear);
  }

  private fillCardWithColor() {
    this.processCards();
  }

  private processCards = async () => {
    const cards = document.querySelectorAll(
      `${BoardPagePageObject.selectors.issue}:not(${BoardPagePageObject.selectors.flagged}):not([${this.processedAttribute}])`
    );

    cards.forEach(card => {
      processCard({
        card: card as HTMLElement,
        processedAttribute: this.processedAttribute,
      });
    });
  };

  private isFlagged(card: HTMLElement) {
    return card.classList.contains(BoardPagePageObject.classlist.flagged);
  }

  private isAlreadyColoredByOtherTools = (card: HTMLElement) => {
    const color = card.style.backgroundColor;
    return Object.values(excludeColors).some(c => c === color);
  };

  private markCardAsProcessed(card: Element) {
    card.setAttribute(this.processedAttribute, '');
  }

  private async getCardColorsEnabled(): Promise<boolean> {
    const boardId = this.getBoardId();
    if (!boardId) {
      return Promise.reject(new Error('no board id'));
    }
    const cardColorsEnabled = await getBoardProperty(boardId, 'card-colors');
    return cardColorsEnabled === true;
  }
}
