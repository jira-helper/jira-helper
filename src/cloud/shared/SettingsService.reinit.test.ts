import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsService } from './SettingsService';

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 404,
    statusText: ok ? 'OK' : 'Not Found',
    text: async () => (body == null ? '' : JSON.stringify(body)),
  };
}

describe('SettingsService.reinitForCurrentBoard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('reloads board properties for the current board id and notifies listeners', async () => {
    let boardId = 1;
    const fetchImpl = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url === '/rest/agile/1.0/board/1' || url === '/rest/agile/1.0/board/2') {
        return jsonResponse({});
      }
      if (url.includes('/board/1/properties/jira-helper-person-limits-v1')) {
        return jsonResponse({ value: { value: { enabled: true, limits: [{ id: 'old' }] } } });
      }
      if (url.includes('/board/2/properties/jira-helper-person-limits-v1')) {
        return jsonResponse({ value: { value: { enabled: true, limits: [{ id: 'new' }] } } });
      }
      return jsonResponse(null, false);
    });
    vi.stubGlobal('fetch', fetchImpl);

    const service = new SettingsService({ getBoardId: () => boardId } as never);
    await service.waitForInit();
    expect(service.getSettings().personalWipLimits.limits).toEqual([{ id: 'old' }]);

    const onChange = vi.fn();
    service.onSettingsChanged(onChange);

    boardId = 2;
    await service.reinitForCurrentBoard();

    expect(service.getSettings().personalWipLimits.limits).toEqual([{ id: 'new' }]);
    expect(onChange).toHaveBeenCalled();
  });
});
