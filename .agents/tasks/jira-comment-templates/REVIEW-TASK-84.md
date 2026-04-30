# Review: TASK-84 — Jira Watchers API

**Дата**: 2026-04-30
**TASK**: [TASK-84](./TASK-84-jira-watchers-api.md)
**Status**: APPROVED

## Findings

### Critical

Нет.

### Warning

Нет.

### Nit

Нет.

## Verification

- `npm test -- --run src/infrastructure/jira/jiraService.test.ts` — OK, 5 tests.
- `npx eslint src/infrastructure/jira/jiraApi.ts src/infrastructure/jira/jiraService.ts src/infrastructure/jira/jiraService.test.ts src/features/sub-tasks-progress/BoardSettings/BoardSettingsTabContent.stories.tsx src/features/sub-tasks-progress/BoardSettings/GroupingSettings/CustomGroups/CustomGroupSettingsContainer.stories.tsx --quiet` — OK.
- `npm test -- --run` — OK, 140 files / 1541 tests.
- `npm run lint:typescript` — fails only on unrelated in-progress files under `src/features/jira-comment-templates-module/Settings`, `src/features/jira-comment-templates-module/Storage`, and `src/infrastructure/storage/LocalStorageService.test.ts`; no remaining `TASK-84` watcher/API or typed mock errors.

## Review Notes

- Previous blocker is fixed: the typed `JiraServiceToken` Storybook mocks in `BoardSettingsTabContent.stories.tsx` and `CustomGroupSettingsContainer.stories.tsx` now include `addWatcher`.
- Previous warning is fixed: `jiraService.test.ts` asserts the `browser-plugin` extension header on the 204 path and covers merging caller headers without dropping `browser-plugin` or `Content-Type`.
- REST contract review passes: `jiraApi.addWatcher` posts to `api/2/issue/{issueKey}/watchers`, sends `JSON.stringify(username)`, preserves Jira request headers/options, treats 2xx as success, and `JiraService.addWatcher` returns `Result<void, Error>` with `issueKey`/`username` context on API and thrown errors.

## Summary

`TASK-84` is approved. The Jira watcher API implementation matches the expected Server REST contract, typed consumers touched by this interface expansion are updated, and targeted plus full Vitest checks pass; the remaining full TypeScript lint failures are outside the TASK-84 surface.
