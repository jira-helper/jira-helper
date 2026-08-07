import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applySwimlaneStickyPadding, clearSwimlaneStickyPadding } from './applySwimlaneStickyPadding';

describe('applySwimlaneStickyPadding', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ghx-swimlane-header"></div>
      <div class="ghx-swimlane-header"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets paddingLeft on all swimlane headers to scrollLeft in px', () => {
    applySwimlaneStickyPadding(120);

    const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
    expect(headers[0].style.paddingLeft).toBe('120px');
    expect(headers[1].style.paddingLeft).toBe('120px');
  });

  it('updates padding when scrollLeft changes', () => {
    applySwimlaneStickyPadding(50);
    applySwimlaneStickyPadding(200);

    const header = document.querySelector<HTMLElement>('.ghx-swimlane-header')!;
    expect(header.style.paddingLeft).toBe('200px');
  });
});

describe('clearSwimlaneStickyPadding', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ghx-swimlane-header" style="padding-left: 80px"></div>
      <div class="ghx-swimlane-header" style="padding-left: 80px"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('clears paddingLeft on all swimlane headers', () => {
    clearSwimlaneStickyPadding();

    const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
    expect(headers[0].style.paddingLeft).toBe('');
    expect(headers[1].style.paddingLeft).toBe('');
  });
});
