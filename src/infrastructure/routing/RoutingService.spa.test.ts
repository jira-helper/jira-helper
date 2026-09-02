import { afterEach, describe, expect, it, vi } from 'vitest';

import { RoutingService } from './RoutingService';

describe('RoutingService SPA url changes', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('notifies every onUrlChange listener when pushState changes the board', () => {
    const first = vi.fn();
    const second = vi.fn();
    const routing = new RoutingService({
      onMessage: vi.fn(),
    } as never);

    routing.onUrlChange(first);
    routing.onUrlChange(second);

    window.history.pushState({}, '', '/jira/software/projects/TRB/boards/9');

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(window.location.href);
  });
});
