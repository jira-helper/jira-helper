import { Token } from 'dioma';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { debounce } from 'src/shared/utils';
import { applySwimlaneStickyPadding, clearSwimlaneStickyPadding } from './applySwimlaneStickyPadding';

export const POOL_COLUMN_SELECTOR = '#ghx-pool-column';
const SCROLL_DEBOUNCE_MS = 16;

/**
 * Keeps swimlane headers visible while the board scrolls horizontally
 * by syncing header paddingLeft to #ghx-pool-column scrollLeft.
 */
export class SwimlaneStickyModification extends PageModification<void, Element> {
  private pool: HTMLElement | null = null;
  private readonly onScroll = debounce(() => {
    if (!this.pool) return;
    applySwimlaneStickyPadding(this.pool.scrollLeft);
  }, SCROLL_DEBOUNCE_MS);

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `swimlane-sticky-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(POOL_COLUMN_SELECTOR);
  }

  async apply(): Promise<void> {
    this.pool = document.querySelector(POOL_COLUMN_SELECTOR);
    if (!this.pool) return;

    this.addEventListener(this.pool, 'scroll', this.onScroll);
    applySwimlaneStickyPadding(this.pool.scrollLeft);

    this.sideEffects.push(() => {
      clearSwimlaneStickyPadding();
      this.pool = null;
    });
  }
}

export const swimlaneStickyModificationToken = new Token<SwimlaneStickyModification>('SwimlaneStickyModification');
