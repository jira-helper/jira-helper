import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { PageModification } from '../shared/PageModification';
import { processCard } from './processCard';
import { PropertyValue } from './types';

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

    this.onDOMChange(BoardPagePageObject.selectors.pool, () => {
      this.fillCardWithColor();
    });
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

  private async getCardColorsEnabled(): Promise<boolean> {
    const cardColorsSettings = await this.getBoardProperty<PropertyValue>('card-colors');
    return cardColorsSettings?.value === true;
  }
}
