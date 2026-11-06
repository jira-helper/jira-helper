import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { waitForJiraPage } from './utils';

const docWith = (id: string | undefined) => ({ body: { id } as HTMLElement });

describe('waitForJiraPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves immediately when the page is already a jira page', async () => {
    let resolved: boolean | undefined;
    void waitForJiraPage(docWith('jira')).then(value => {
      resolved = value;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });

  it('resolves true once the body gets the jira id', async () => {
    const doc = docWith('');
    let resolved: boolean | undefined;
    void waitForJiraPage(doc).then(value => {
      resolved = value;
    });

    await vi.advanceTimersByTimeAsync(600);
    expect(resolved).toBeUndefined();

    doc.body.id = 'jira';
    await vi.advanceTimersByTimeAsync(200);
    expect(resolved).toBe(true);
  });

  it('resolves false after the timeout when no jira body shows up', async () => {
    let resolved: boolean | undefined;
    void waitForJiraPage(docWith(''), 1_000).then(value => {
      resolved = value;
    });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(resolved).toBe(false);
  });
});
