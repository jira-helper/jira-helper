import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { SwimlaneStickyModification } from './SwimlaneStickyModification';
import type { IRoutingService } from 'src/infrastructure/routing';
import { routingServiceToken } from 'src/infrastructure/routing';
import { registerRoutingInDI } from 'src/infrastructure/di/routingTokens';
import { registerExtensionApiServiceInDI } from 'src/infrastructure/extension-api/ExtensionApiService';

describe('SwimlaneStickyModification', () => {
  let modification: SwimlaneStickyModification;
  const mockGetSearchParam = vi.fn();
  const mockGetBoardIdFromURL = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);

    const mockRouting: IRoutingService = {
      getSearchParam: mockGetSearchParam,
      getBoardIdFromURL: mockGetBoardIdFromURL,
      getReportNameFromURL: vi.fn(),
      getCurrentRoute: vi.fn(),
      getIssueId: vi.fn(),
      getProjectKeyFromURL: vi.fn(),
      onUrlChange: vi.fn(),
    };
    globalContainer.register({ token: routingServiceToken, value: mockRouting });
    registerRoutingInDI(globalContainer);

    modification = new SwimlaneStickyModification();
    mockGetBoardIdFromURL.mockReturnValue('42');
    mockGetSearchParam.mockReturnValue(null);

    document.body.innerHTML = `
      <div id="ghx-pool-column">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-swimlane-header"></div>
      </div>
    `;
  });

  afterEach(() => {
    modification.clear();
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('shouldApply', () => {
    it('returns true when view is null', () => {
      mockGetSearchParam.mockReturnValue(null);
      expect(modification.shouldApply()).toBe(true);
    });

    it('returns true when view is detail', () => {
      mockGetSearchParam.mockReturnValue('detail');
      expect(modification.shouldApply()).toBe(true);
    });

    it('returns false when view is not detail', () => {
      mockGetSearchParam.mockReturnValue('plan');
      expect(modification.shouldApply()).toBe(false);
    });
  });

  describe('getModificationId', () => {
    it('includes board id', () => {
      expect(modification.getModificationId()).toBe('swimlane-sticky-42');
    });
  });

  describe('apply / clear', () => {
    it('syncs header paddingLeft with pool scrollLeft after debounce', async () => {
      await modification.apply();

      const pool = document.getElementById('ghx-pool-column')!;
      Object.defineProperty(pool, 'scrollLeft', { value: 150, configurable: true });
      pool.dispatchEvent(new Event('scroll'));

      vi.advanceTimersByTime(16);

      const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
      expect(headers[0].style.paddingLeft).toBe('150px');
      expect(headers[1].style.paddingLeft).toBe('150px');
    });

    it('clears padding and stops listening on clear', async () => {
      await modification.apply();

      const pool = document.getElementById('ghx-pool-column')!;
      Object.defineProperty(pool, 'scrollLeft', { value: 90, configurable: true });
      pool.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);

      modification.clear();

      const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
      expect(headers[0].style.paddingLeft).toBe('');

      Object.defineProperty(pool, 'scrollLeft', { value: 300, configurable: true });
      pool.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);

      expect(headers[0].style.paddingLeft).toBe('');
    });
  });
});
