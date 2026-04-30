NON_BLOCKING_GAP

# Review: TASK-86 — Comments Editor PageObject

**Дата**: 2026-04-30
**TASK**: [TASK-86](./TASK-86-comments-editor-page-object.md)
**Status**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.ts:145]**: rich-editor insertion mutates light-DOM text/contenteditable and dispatches plain `input` / `change` events, with a code comment saying live Jira semantics remain QA. This may not update Jira's internal rich editor model when the real editor stores state outside the edited DOM node.
  - Предложение: verify on live Jira before accepting this as production-ready; if Jira does not submit the inserted text, use the editor's actual editable surface / native input path and add the closest reproducible unit coverage.

### Nit

- **[src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.ts:222]**: `observer: null as unknown as MutationObserver` is an avoidable double assertion in production code.
  - Предложение: make `AttachmentState.observer` nullable/optional during construction, or create the observer before assembling the final state object.

## Test Gaps / Residual Risk

- Previous `BLOCKED_BY_DESIGN` items are closed: discovery now uses `resolveInsertSurface` for wiki-only `.jira-wikifield` / `#comment-wiki-edit`, and `CommentsEditorPageObject` delegates issue-key lookup through `IssueViewPageObject.getIssueKey()` and `BoardPagePageObject.getSelectedIssueKey?.()`.
- DOM lifecycle coverage now includes idempotent same-key attachment, mutation dedupe, removal cleanup via `MutationObserver`, `insertText` returning `Err` after removal, and dialog shells `[role="dialog"]`, `.aui-dialog2`, `.jira-dialog`, `.aui-dialog`.
- Production `CommentsEditor` code has no `act(` and no direct `window.location` / `location.` usage.
- Targeted tests passed: `npm test -- --run src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.test.ts src/infrastructure/page-objects/IssueViewPageObject.test.ts src/infrastructure/page-objects/BoardPage.test.ts` (89 tests).
- Full `npm test` and eslint were not rerun during this review pass.

## Summary

Approved. The previously blocking design gaps are fixed, module boundaries are now aligned with the target design, duplicate attachment / cleanup behavior is covered by tests, and no production React testing API usage was found. Remaining items are non-blocking: live Jira verification for rich-editor insertion semantics and a small type assertion cleanup.
