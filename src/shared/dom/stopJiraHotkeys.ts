import type React from 'react';

/**
 * Stops a keyboard event from reaching Jira's global hotkey handlers.
 *
 * Jira binds shortcuts (a, c, /, etc.) on `document`/`window` in the bubbling
 * phase. When the user types those letters into one of our `<Input>` fields
 * the synthetic React event still bubbles up to the native handler, so the
 * letter triggers a Jira shortcut (open assign dialog, comment box, search…)
 * instead of producing text in the input.
 *
 * We can't simply `preventDefault` — that would block the typed character.
 * Instead we stop both React-level propagation and DOM-level propagation
 * (`stopImmediatePropagation` on the underlying KeyboardEvent), which keeps
 * the input behaving normally while making Jira's handler never fire.
 *
 * Use as a drop-in `onKeyDown`/`onKeyUp` handler on any of our text inputs
 * that the user is expected to type into while staying on a Jira page.
 */
export const stopJiraHotkeys = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
};
