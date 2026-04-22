import { describe, it, expect, vi } from 'vitest';
import { stopJiraHotkeys } from './stopJiraHotkeys';

describe('stopJiraHotkeys', () => {
  it('calls stopPropagation on the React event and stopImmediatePropagation on the native one', () => {
    const stopPropagation = vi.fn();
    const stopImmediatePropagation = vi.fn();
    const event = {
      stopPropagation,
      nativeEvent: { stopImmediatePropagation },
    } as unknown as React.KeyboardEvent;

    stopJiraHotkeys(event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });
});
