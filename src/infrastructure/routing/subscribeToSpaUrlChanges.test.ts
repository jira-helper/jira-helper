import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeToSpaUrlChanges } from './subscribeToSpaUrlChanges';

describe('subscribeToSpaUrlChanges', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('notifies when pushState changes the href', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSpaUrlChanges(onChange);

    window.history.pushState({}, '', '/jira/software/projects/KAN/boards/2');

    expect(onChange).toHaveBeenCalledWith(window.location.href);
    unsubscribe();
  });

  it('does not notify when href stays the same', () => {
    window.history.replaceState({}, '', '/jira/software/projects/KAN/boards/1');
    const onChange = vi.fn();
    const unsubscribe = subscribeToSpaUrlChanges(onChange);

    window.history.replaceState({}, '', '/jira/software/projects/KAN/boards/1');

    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSpaUrlChanges(onChange);
    unsubscribe();

    window.history.pushState({}, '', '/jira/software/projects/TRB/boards/9');

    expect(onChange).not.toHaveBeenCalled();
  });
});
