import { describe, expect, it, vi } from 'vitest';

import { startCloudExtension } from './startCloudExtension';

function createDocument(readyState: DocumentReadyState, body: HTMLElement | null = {} as HTMLElement) {
  const listeners = new Map<string, EventListenerOrEventListenerObject>();

  return {
    documentRef: {
      readyState,
      body,
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.set(type, listener);
      }),
    },
    dispatch(type: string) {
      const listener = listeners.get(type);

      if (typeof listener === 'function') {
        listener(new Event(type));
      }
    },
  };
}

describe('startCloudExtension', () => {
  it('starts immediately when Jira Cloud keeps document loading but body exists', () => {
    const initialize = vi.fn().mockResolvedValue(undefined);
    const { documentRef } = createDocument('loading');

    startCloudExtension(initialize, documentRef);

    expect(initialize).toHaveBeenCalledOnce();
  });

  it('does not start twice after DOMContentLoaded', () => {
    const initialize = vi.fn().mockResolvedValue(undefined);
    const { documentRef, dispatch } = createDocument('loading');

    startCloudExtension(initialize, documentRef);
    dispatch('DOMContentLoaded');

    expect(initialize).toHaveBeenCalledOnce();
  });

  it('waits for DOMContentLoaded when body is not available yet', () => {
    const initialize = vi.fn().mockResolvedValue(undefined);
    const body = {} as HTMLElement;
    const { documentRef, dispatch } = createDocument('loading', null);

    startCloudExtension(initialize, documentRef);
    documentRef.body = body;
    dispatch('DOMContentLoaded');

    expect(initialize).toHaveBeenCalledOnce();
  });

  it('retries until body appears even when DOMContentLoaded does not fire', () => {
    const initialize = vi.fn().mockResolvedValue(undefined);
    const body = {} as HTMLElement;
    const { documentRef } = createDocument('loading', null);
    const scheduledCallbacks: Array<() => void> = [];

    startCloudExtension(initialize, documentRef, {
      setTimeout: callback => {
        scheduledCallbacks.push(callback);
      },
    });

    expect(initialize).not.toHaveBeenCalled();

    documentRef.body = body;
    scheduledCallbacks[0]();

    expect(initialize).toHaveBeenCalledOnce();
  });
});
