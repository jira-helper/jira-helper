const SWIMLANE_HEADER_SELECTOR = '.ghx-swimlane-header';

export function applySwimlaneStickyPadding(scrollLeft: number): void {
  document.querySelectorAll<HTMLElement>(SWIMLANE_HEADER_SELECTOR).forEach(el => {
    el.style.paddingLeft = `${scrollLeft}px`;
  });
}

export function clearSwimlaneStickyPadding(): void {
  document.querySelectorAll<HTMLElement>(SWIMLANE_HEADER_SELECTOR).forEach(el => {
    el.style.paddingLeft = '';
  });
}
