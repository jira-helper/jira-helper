import { beforeEach, describe, expect, it } from 'vitest';
import { processCard } from './processCard';

describe('processCard', () => {
  const selectors = { grabber: '.ghx-grabber' };
  const flaggedClass = 'ghx-flagged';
  const hslFromRGB = () => [0, 1, 0.5];

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  it('paints card through a generated css class instead of inline background', () => {
    const card = document.createElement('div');
    card.className = 'ghx-issue';
    card.innerHTML = '<span class="ghx-grabber"></span>';
    const grabber = card.querySelector<HTMLElement>('.ghx-grabber')!;
    grabber.style.backgroundColor = 'rgb(232, 21, 21)';
    document.body.append(card);

    processCard({ card, processedAttribute: 'jh-card-colors-processed' }, selectors, flaggedClass, hslFromRGB);

    expect(card.hasAttribute('jh-card-colors-processed')).toBe(true);
    expect(card.style.backgroundColor).toBe('');
    expect([...card.classList]).toContain('jh-card-color-232-21-21');
    expect(document.getElementById('jh-card-colors-style')?.textContent).toContain(
      '.jh-card-color-232-21-21{background-color:hsl(0, 100%, 80%) !important;}'
    );
  });

  it('keeps css class paint when Jira clears inline style', () => {
    const card = document.createElement('div');
    card.innerHTML = '<span class="ghx-grabber"></span>';
    const grabber = card.querySelector<HTMLElement>('.ghx-grabber')!;
    grabber.style.backgroundColor = 'rgb(232, 21, 21)';
    document.body.append(card);

    processCard({ card, processedAttribute: 'jh-card-colors-processed' }, selectors, flaggedClass, hslFromRGB);
    card.setAttribute('style', '');

    expect(card.classList.contains('jh-card-color-232-21-21')).toBe(true);
    expect(document.getElementById('jh-card-colors-style')?.textContent).toContain(
      '.jh-card-color-232-21-21{background-color:hsl(0, 100%, 80%) !important;}'
    );
  });

  it('does not rewrite class attribute when the target color class is already applied', async () => {
    const card = document.createElement('div');
    card.innerHTML = '<span class="ghx-grabber"></span>';
    const grabber = card.querySelector<HTMLElement>('.ghx-grabber')!;
    grabber.style.backgroundColor = 'rgb(232, 21, 21)';
    document.body.append(card);

    processCard({ card, processedAttribute: 'jh-card-colors-processed' }, selectors, flaggedClass, hslFromRGB);

    let classMutationCount = 0;
    const observer = new MutationObserver(mutations => {
      classMutationCount += mutations.filter(mutation => mutation.attributeName === 'class').length;
    });
    observer.observe(card, { attributes: true, attributeFilter: ['class'] });

    processCard({ card, processedAttribute: 'jh-card-colors-processed' }, selectors, flaggedClass, hslFromRGB);
    await Promise.resolve();

    observer.disconnect();
    expect(classMutationCount).toBe(0);
  });
});
