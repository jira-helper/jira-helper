# Handoff: Jira Comment Templates

**Date**: 2026-04-30
**Status**: requirements agreed, target design drafted, implementation not started
**Feature folder**: `.agents/tasks/jira-comment-templates/`

## Context

The user wants to migrate the standalone Chrome extension `~/Downloads/jira-templates-extension` into `jira-helper` as a new module: `src/features/jira-comment-templates-module/`.

The feature adds comment template buttons near Jira comment editors. A user clicks a template, the template text is inserted into the active Jira comment field, and optional watchers from the template are added to the current issue through Jira REST API.

## Current Artifacts

- `request.md` — original request and investigation notes.
- `requirements.md` — agreed requirements, updated after design review.
- `target-design.md` — current architecture and implementation plan.
- `TASK-74-research-transition-dialog-issue-key.md` — follow-up research task for workflow/transition dialog issue-key lookup.
- `handoff.md` — this file.

No `src/` implementation has been started in this handoff state. Current git status for this feature is only the new `.agents/tasks/jira-comment-templates/` bundle.

## Agreed Product Scope

MVP includes:

- Toolbar near Jira comment forms on issue view and board detail panel.
- Template insertion into Jira wiki textarea / rich editor variants observed in current Jira: `.jira-wikifield`, `#comment-wiki-edit`, `textarea#comment`, `rich-editor`.
- Template management through Jira Helper UI/settings, not the old popup.
- Local persistence in Jira/content-script `localStorage`.
- JSON export/import, including legacy JSON array exported by the old extension.
- Import loads into settings draft only; explicit Save persists it.
- Watchers are mandatory MVP behavior and are added after successful text insertion.
- Watcher logins are not pre-validated; send them as entered and aggregate Jira API results.
- Watcher result notification appears in the top-right corner and auto-hides after 5 seconds.
- Two neutral default templates:
  - `Взял в работу`
  - `Нужно уточнение`

Out of MVP:

- Original extension popup.
- CNT branding.
- Automatic migration from the old extension.
- TinyMCE compatibility. This was inherited from the old extension but is not a confirmed requirement now.
- Workflow/transition dialog support until issue-key lookup is researched.

## Key Architecture Decisions

Create a new feature module:

```text
src/features/jira-comment-templates-module/
├── Storage/
├── Settings/
└── Editor/
```

Responsibilities:

- `Storage` owns persisted templates, default fallback, normalization, import/export payload shape and `localStorage` key.
- `Settings` owns draft editing, validation, import-to-draft, save/discard/reset.
- `Editor` owns toolbar state, template click orchestration, insertion flow and watcher aggregation.

Shared infrastructure:

- Add `src/infrastructure/storage/LocalStorageService` with `localStorageServiceToken`.
- Add shared `src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject`.
- Extend existing `IJiraService` / `JiraService` / `jiraApi.ts` with `addWatcher(issueKey, username, signal?)`.

Important boundary:

- React containers must not inspect Jira DOM or call Jira API.
- Models may orchestrate DOM actions only through injected PageObjects.
- `CommentsEditorPageObject` owns comment editor discovery, mount lifecycle, editor insertion, marker attributes and editor id registry.

## Editor Flow

The latest agreed flow:

1. `CommentTemplatesPageModification` runs only on `Routes.BOARD` and `Routes.ISSUE`.
2. PageModification registers settings tabs and calls:

```ts
commentsEditorPageObject.attachTools('jira-comment-templates', CommentTemplatesToolbarContainer);
```

1. `CommentsEditorPageObject` finds supported comment editors, creates an opaque `CommentEditorId`, and mounts the toolbar with:

```ts
export type CommentTemplatesToolbarContainerProps = {
  commentEditorId: CommentEditorId;
};
```

1. User clicks a template.
2. Toolbar container calls:

```ts
editorModel.insertTemplate({ commentEditorId, templateId });
```

1. `CommentTemplatesEditorModel` gets the template from `TemplatesStorageModel`.
2. The model calls:

```ts
commentsEditorPageObject.insertText(commentEditorId, template.text);
```

1. If insertion succeeds and the PageObject returns an `issueKey`, the model adds watchers through `IJiraService.addWatcher(...)`.
2. The model aggregates watcher results; toolbar shows a top-right notification for 5 seconds.

## Issue Key Resolution

Current decision:

- On issue view, `CommentsEditorPageObject` should delegate key lookup to `IssueDetailsPageObject` / current project `IssueViewPageObject`.
- On board detail panel, delegate to `BoardPagePageObject`, which should expose the currently opened issue key.
- If no issue key is available, insertion still works and watcher aggregation returns `skipped` / warning.
- Workflow/transition dialog issue-key lookup is not part of MVP. Use `TASK-74-research-transition-dialog-issue-key.md` before implementing it.

## Testing Expectations

Do not add dedicated `CommentsEditorPageObject` tests as part of this MVP. The user explicitly said PageObject tests are not needed here.

Expected coverage:

- Unit tests for models and pure utilities.
- Component tests for settings and toolbar interactions.
- Live Jira QA / smoke for actual comment editor insertion and rich editor behavior.
- ESLint before finish per project rules.

## Recommended Next Step

Start implementation by decomposing the design into concrete task files or begin with the first implementation slice:

1. Contracts/module skeleton for `jira-comment-templates-module`.
2. `LocalStorageService` infrastructure and `Storage` domain.
3. Shared `CommentsEditorPageObject` contract and implementation.
4. `Editor` model + toolbar UI.
5. Settings model + UI.
6. Jira watcher API extension.
7. QA and route hardening.

Before coding, read:

- `.claude/skills/tdd/SKILL.md`
- `.claude/skills/testing/SKILL.md`
- `.cursor/rules/eslint-before-finish.mdc`
- `docs/architecture_guideline.md`
- `docs/state-valtio.md`

## Watch Outs

- `CommentEditorId` is an opaque runtime handle, not a selector, issue key or persisted id.
- Watchers must run only after successful text insertion.
- Settings import must modify draft only and must not persist until Save.
- Keep all feature code inside `src/features/jira-comment-templates-module/`; shared PageObject, localStorage service and Jira API changes live in infrastructure.
- Do not resurrect TinyMCE or transition dialog into MVP unless the user explicitly reopens that scope.
