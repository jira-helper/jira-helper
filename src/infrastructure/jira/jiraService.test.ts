import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addWatcher as jiraApiAddWatcher } from './jiraApi';
import { JiraService } from './jiraService';
import { getJiraWebBaseUrl } from './jiraWebContext';

describe('JiraService.addWatcher', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns Ok(undefined) for 204 and sends POST with JSON-encoded username body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204, statusText: 'No Content' }));
    globalThis.fetch = fetchMock;

    const service = new JiraService();
    const controller = new AbortController();
    const result = await service.addWatcher('PROJ-1', 'iv.petrov', controller.signal);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${getJiraWebBaseUrl()}/rest/api/2/issue/PROJ-1/watchers`);
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify('iv.petrov'));
    const headers = new Headers(init.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('browser-plugin')).toMatch(/^jira-helper\//);
    expect(init.signal).toBe(controller.signal);
  });

  it('jiraApi.addWatcher merges caller headers without dropping browser-plugin or Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204, statusText: 'No Content' }));
    globalThis.fetch = fetchMock;

    const result = await jiraApiAddWatcher('PROJ-9', 'user.one', { headers: { 'X-Custom-Test': '1' } });

    expect(result.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('browser-plugin')).toMatch(/^jira-helper\//);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Custom-Test')).toBe('1');
  });

  it('returns Ok(undefined) for 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200, statusText: 'OK' }));

    const service = new JiraService();
    const result = await service.addWatcher('ABC-2', 'user.name');

    expect(result.ok).toBe(true);
  });

  it('returns Err with issueKey and username context on non-2xx', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 400, statusText: 'Bad Request' }));

    const service = new JiraService();
    const result = await service.addWatcher('X-1', 'u1');

    expect(result.err).toBe(true);
    if (result.ok) {
      throw new Error('expected Err');
    }
    expect(result.val.message).toContain('addWatcher issueKey=X-1 username=u1');
    expect(result.val.message).toContain('400');
  });

  it('returns Err with issueKey and username context on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const service = new JiraService();
    const result = await service.addWatcher('K-3', 'bob');

    expect(result.err).toBe(true);
    if (result.ok) {
      throw new Error('expected Err');
    }
    expect(result.val.message).toContain('addWatcher issueKey=K-3 username=bob');
    expect(result.val.message).toContain('Failed to fetch');
  });
});
