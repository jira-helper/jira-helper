import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { onDOMChange } from 'src/shared/domUtils';
import { hslFromRGB } from 'src/shared/utils';
import { getBoardProperty } from 'src/shared/jiraApi';
import { PageModification } from '../shared/PageModification';

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

    // Define a function to handle card coloring
    const colorCard = (card: HTMLElement) => {
      // Get the grabber element and its background color
      const grabber = card.querySelector(BoardPagePageObject.selectors.grabber);

      if (!grabber) {
        return;
      }

      // rgb(77, 184, 86)
      const color = (grabber as HTMLElement).style.backgroundColor;

      // test color is ok format
      const colorIsOk = color.match(/rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)/);

      if (!colorIsOk) {
        return;
      }
      const [rgbString] = colorIsOk;
      const [r, g, b] = rgbString.match(/\d{1,3}/g)!.map(Number);
      const [h, s, l] = hslFromRGB(r, g, b);

      const newL = l + 0.3 > 1 ? 1 : l + 0.3;

      const lighterColor = `hsl(${h}, ${s * 100}%, ${newL * 100}%)`;

      const currentColor = card.style.backgroundColor;

      card.setAttribute(this.processedAttribute, currentColor);
      // Apply the lighter color to the card
      card.style.backgroundColor = lighterColor;
    };

    // Loop through each card and check for dynamically appearing grabbers
    cards.forEach(card => {
      const grabber = card.querySelector(BoardPagePageObject.selectors.grabber);

      if (!grabber) {
        return;
      }
      const color = (grabber as HTMLElement).style.backgroundColor;

      if (color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)' && color !== '') {
        // Color the card if the grabber has a background color
        this.markCardAsProcessed(card);

        if (this.isAlreadyColoredByOtherTools(card as HTMLElement)) {
          return;
        }

        if (this.isFlagged(card as HTMLElement)) {
          return;
        }
        colorCard(card as HTMLElement);
      }
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
