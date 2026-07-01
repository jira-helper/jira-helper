import { describe, expect, it, vi } from 'vitest';

import { detectJiraRuntime, type JiraRuntime } from './content-loader';

function createLocation(overrides: Partial<Location>): Location {
  return {
    hostname: '',
    pathname: '/',
    search: '',
    href: 'https://example.com/',
    ...overrides,
  } as Location;
}

function createDocument(body: HTMLElement | null = null) {
  const listeners = new Map<string, EventListenerOrEventListenerObject>();

  return {
    documentRef: {
      body,
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.set(type, listener);
      }),
    } as Pick<Document, 'body' | 'addEventListener'>,
    dispatch(type: string) {
      const listener = listeners.get(type);

      if (typeof listener === 'function') {
        listener(new Event(type));
      }
    },
  };
}

describe('detectJiraRuntime', () => {
  it('detects Atlassian hosted Jira Cloud immediately', async () => {
    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'company.atlassian.net', pathname: '/jira/software/projects/KAN/boards/1' }),
      documentRef: createDocument().documentRef,
    });

    expect(runtime).toBe('cloud');
  });

  it('detects Jira Cloud board path on custom domains', async () => {
    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'jira.example.com', pathname: '/jira/software/projects/KAN/boards/1' }),
      documentRef: createDocument().documentRef,
    });

    expect(runtime).toBe('cloud');
  });

  it('detects Jira Server rapid board urls', async () => {
    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'jira.example.com', pathname: '/secure/RapidBoard.jspa' }),
      documentRef: createDocument().documentRef,
    });

    expect(runtime).toBe('server');
  });

  it('ignores non-Jira pages after body is available', async () => {
    const body = { id: '' } as HTMLElement;
    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'example.com', pathname: '/' }),
      documentRef: createDocument(body).documentRef,
    });

    expect(runtime).toBe('none');
  });

  it('uses Cloud serverInfo probe before falling back to Server for unknown Jira pages', async () => {
    const body = { id: 'jira' } as HTMLElement;
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'jira.example.com', pathname: '/browse/KAN-1' }),
      documentRef: createDocument(body).documentRef,
      fetchImpl,
    });

    expect(runtime).toBe('cloud');
    expect(fetchImpl).toHaveBeenCalledWith('/rest/api/3/serverInfo', expect.any(Object));
  });

  it('falls back to Server when unknown Jira page does not answer Cloud serverInfo', async () => {
    const body = { id: 'jira' } as HTMLElement;
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });

    const runtime = await detectJiraRuntime({
      location: createLocation({ hostname: 'jira.example.com', pathname: '/browse/KAN-1' }),
      documentRef: createDocument(body).documentRef,
      fetchImpl,
    });

    expect(runtime).toBe<JiraRuntime>('server');
  });
});
