import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { hslFromRGB } from 'src/shared/utils';

const excludeColors = {
  jiraHelperWIP: 'rgb(255, 86, 48)',
};

interface ProcessCardOptions {
  card: HTMLElement;
  processedAttribute: string;
}

function isAlreadyColoredByOtherTools(card: HTMLElement): boolean {
  const color = card.style.backgroundColor;
  return Object.values(excludeColors).some(c => c === color);
}

function isFlagged(card: HTMLElement): boolean {
  return card.classList.contains(BoardPagePageObject.classlist.flagged);
}

function paintCard(card: HTMLElement, grabber: HTMLElement): void {
  const color = grabber.style.backgroundColor;
  const colorIsOk = color.match(/rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)/);

  if (!colorIsOk) {
    return;
  }

  const [rgbString] = colorIsOk;
  const [r, g, b] = rgbString.match(/\d{1,3}/g)!.map(Number);
  const [h, s, l] = hslFromRGB(r, g, b);

  const newL = l + 0.3 > 1 ? 1 : l + 0.3;

  // If the lighter color would be white or too close to white, use midpoint between current L and 0.95
  let finalL: number;
  if (newL >= 0.95) {
    finalL = (l + 0.95) / 2;
  } else {
    finalL = newL;
  }

  const finalColor = `hsl(${h}, ${s * 100}%, ${finalL * 100}%)`;

  const currentColor = card.style.backgroundColor;
  card.setAttribute('current-color', currentColor);
  card.style.backgroundColor = finalColor;
}

function markCardAsProcessed(card: Element, processedAttribute: string): void {
  card.setAttribute(processedAttribute, '');
}

export function processCard({ card, processedAttribute }: ProcessCardOptions): void {
  const grabber = card.querySelector(BoardPagePageObject.selectors.grabber) as HTMLElement;
  if (!grabber) {
    return;
  }

  const color = grabber.style.backgroundColor;

  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)' || color === '') {
    return;
  }

  markCardAsProcessed(card, processedAttribute);

  if (isFlagged(card)) {
    return;
  }

  if (isAlreadyColoredByOtherTools(card)) {
    return;
  }

  paintCard(card, grabber);
}
