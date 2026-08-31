/* eslint-disable no-console -- Runtime loader reports unknown Jira environments and load failures to the page console. */
export type JiraRuntime = 'cloud' | 'server' | 'none';

type LoaderDocument = Pick<Document, 'body' | 'addEventListener'>;

type RuntimeDetectionOptions = {
  location?: Location;
  documentRef?: LoaderDocument;
  fetchImpl?: typeof fetch;
};

const BODY_WAIT_TIMEOUT_MS = 3_000;
const BODY_WAIT_INTERVAL_MS = 50;
const CLOUD_SERVER_INFO_TIMEOUT_MS = 1_000;

function isAtlassianCloudHost(hostname: string): boolean {
  return hostname === 'atlassian.net' || hostname.endsWith('.atlassian.net');
}

function isCloudBoardPath(pathname: string): boolean {
  return pathname.startsWith('/jira/software/');
}

function isServerRapidBoardPath(pathname: string): boolean {
  return pathname.endsWith('/secure/RapidBoard.jspa') || pathname.includes('/secure/RapidBoard.jspa/');
}

function waitForBody(documentRef: LoaderDocument): Promise<HTMLElement | null> {
  if (documentRef.body) {
    return Promise.resolve(documentRef.body);
  }

  return new Promise(resolve => {
    let elapsedMs = 0;

    const checkBody = () => {
      if (documentRef.body) {
        resolve(documentRef.body);
        return;
      }

      elapsedMs += BODY_WAIT_INTERVAL_MS;
      if (elapsedMs >= BODY_WAIT_TIMEOUT_MS) {
        resolve(null);
        return;
      }

      setTimeout(checkBody, BODY_WAIT_INTERVAL_MS);
    };

    documentRef.addEventListener('DOMContentLoaded', () => resolve(documentRef.body), { once: true });
    setTimeout(checkBody, BODY_WAIT_INTERVAL_MS);
  });
}

async function canReachCloudServerInfo(fetchImpl: typeof fetch): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLOUD_SERVER_INFO_TIMEOUT_MS);

  try {
    const response = await fetchImpl('/rest/api/3/serverInfo', {
      credentials: 'same-origin',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function detectJiraRuntime(options: RuntimeDetectionOptions = {}): Promise<JiraRuntime> {
  const locationRef = options.location ?? window.location;
  const documentRef = options.documentRef ?? document;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (isAtlassianCloudHost(locationRef.hostname) || isCloudBoardPath(locationRef.pathname)) {
    return 'cloud';
  }

  if (isServerRapidBoardPath(locationRef.pathname)) {
    return 'server';
  }

  const body = await waitForBody(documentRef);
  if (body?.id !== 'jira') {
    return 'none';
  }

  if (await canReachCloudServerInfo(fetchImpl)) {
    return 'cloud';
  }

  return 'server';
}

async function startContentLoader(): Promise<void> {
  const runtime = await detectJiraRuntime();

  if (runtime === 'cloud') {
    await import('./cloud/content.cloud');
    return;
  }

  if (runtime === 'server') {
    await import('./content');
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  void startContentLoader().catch(error => {
    console.error('[JiraHelper] Failed to start content loader', error);
  });
}
