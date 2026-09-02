import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsStorage } from './SettingsStorage';

describe('SettingsStorage board id', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the current page-object board id on each request, not the constructor snapshot', async () => {
    const getBoardId = vi.fn(() => 1);
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchImpl);

    const storage = new SettingsStorage({ getBoardId } as never);
    getBoardId.mockReturnValue(2);

    await storage.get('jira-helper-person-limits-v1');

    expect(fetchImpl).toHaveBeenCalledWith(
      '/rest/agile/1.0/board/2/properties/jira-helper-person-limits-v1',
      expect.any(Object)
    );
  });
});
