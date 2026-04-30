# QA: TASK-86 — Comments Editor PageObject

**Дата**: 2026-04-30
**TASK**: [TASK-86](./TASK-86-comments-editor-page-object.md)
**Вердикт**: PASS

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | pass | `npm run lint:eslint -- --fix` завершился без ошибок. |
| Tests | pass | `npm test -- --run`: 141 файлов, 1566 тестов passed. |
| Build | pass | `npm run build:dev` завершился успешно; остались только существующие Vite warnings по `use client`/dynamic import chunking. |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | pass | TASK-86 добавляет page object/DOM contract без пользовательских строк в UI. |
| Accessibility | pass | TASK-86 монтирует host для feature toolbar и не добавляет собственные интерактивные элементы. |
| Storybook | N/A | View-компоненты в рамках TASK-86 не создавались. |

## Дополнительные сценарии

| Сценарий | Результат | Комментарий |
|----------|-----------|-------------|
| repeated mutations do not duplicate toolbar | pass | `attachTools` дедуплицирует по key и проверяет существующий `data-jira-helper-tool`; тест покрывает повторный attach и DOM mutation. |
| removed blocks cleanup registry/root enough that insertText returns Err | pass | `teardownMount` unmount/remove/delete из registry; тест после `addcomment.remove()` проверяет исчезновение toolbar и `insertText` -> `Err`. |
| hidden comment editor does not show toolbar | pass | Регрессионные tests покрывают initial hidden `textarea#comment` и unmount при скрытии активного editor; live smoke на `TTP-19539` подтвердил `toolbarCount: 0` до Add comment, `1` после открытия, `0` после Cancel. |
| wiki-only discovery covered | pass | `resolveInsertSurface` поддерживает `.jira-wikifield` и `#comment-wiki-edit`; есть mount/insert tests без textarea/rich-editor. |
| issue key delegated through page objects | pass | `CommentsEditorPageObject` использует injected/default `IssueViewPageObject.getIssueKey()` и `BoardPagePageObject.getSelectedIssueKey?.()`; прямого `window.location` в CommentsEditor нет. |
| transition/dialog skipped | pass | Пропускаются `[role="dialog"]`, `.aui-dialog2`, `.jira-dialog`, `.aui-dialog`; тесты покрывают dialog shells. |
| no `act` import in production CommentsEditor | pass | В production файлах `src/infrastructure/page-objects/CommentsEditor/*.ts` нет import из `act`; используется `flushSync`. |

## Проблемы

Нет blocking-проблем. Неблокирующий остаточный риск из review сохраняется: live Jira семантика вставки в `rich-editor` может потребовать отдельной проверки на реальной Jira. После hidden-editor fix проверены `npx eslint src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.ts src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.test.ts --fix`, `npx vitest run src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.test.ts`, `npm run build` и live smoke на `TTP-19539`.

## Резюме

TASK-86 проходит автоматические проверки и ручную QA-сверку по указанным сценариям. Scenario gap не найден.
