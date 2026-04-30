# QA: TASK-84 — Jira Watchers API

**Дата**: 2026-04-30
**TASK**: [TASK-84](./TASK-84-jira-watchers-api.md)
**Вердикт**: PASS

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | pass | `npm run lint:eslint -- --fix` завершился без ошибок. |
| Tests | pass | `npm test -- --run`: 140 files / 1541 tests passed. |
| Build | pass | `npm run build:dev` завершился успешно; остались только существующие Vite/Rollup warnings по `use client` в `antd` и dynamic/static imports. |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | N/A | TASK-84 добавляет infrastructure API/service без пользовательских UI-строк. |
| Accessibility | N/A | UI-компоненты и интерактивные элементы в рамках TASK-84 не добавлялись. |
| Storybook | pass | Typed mocks из review обновлены: `BoardSettingsTabContent.stories.tsx` и `CustomGroupSettingsContainer.stories.tsx` содержат `addWatcher`. |

## Дополнительные проверки TASK-84

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| `JiraService.addWatcher` returns `Result<void, Error>` | pass | `IJiraService` и `JiraService.addWatcher` объявлены как `Promise<Result<void, Error>>`. |
| fetch body is JSON string username | pass | `jiraApi.addWatcher` отправляет `body: JSON.stringify(username)`. |
| errors include issueKey and username | pass | Ошибки оборачиваются с контекстом `addWatcher issueKey=... username=...`; тесты проверяют оба значения. |
| Storybook typed mocks include addWatcher | pass | Оба Storybook mock-регистратора `JiraServiceToken` содержат `addWatcher: () => Promise.resolve(new Ok(undefined))`. |
| Scenario gap | pass | Gap из review закрыт; новых пропущенных сценариев по scope TASK-84 не найдено. |

## Проблемы

Нет.

## Резюме

TASK-84 проходит QA. Автоматические проверки зелёные, REST-контракт watcher API и исправления из review подтверждены.
