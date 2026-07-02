# Review: TASK-89 — Toolbar Container

**Дата**: 2026-04-30
**TASK**: [TASK-89](./TASK-89-toolbar-container.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[src/features/jira-comment-templates-module/module.ts:19]**: Runtime-интеграция пока не доведена: `commentTemplatesEditorModelToken` всё ещё TODO, а `CommentTemplatesToolbarContainer` по умолчанию берёт `globalContainer`. Если PageObject начнёт монтировать этот контейнер до TASK-91/DI integration, `container.inject(commentTemplatesEditorModelToken)` упадёт в runtime. Считаю это outside TASK-89 scope, потому что отдельная интеграционная задача явно запланирована, но риск нужно не потерять перед включением PageModification.
  - Предложение: в TASK-91 зарегистрировать `jiraCommentTemplatesModule.ensure(container)`, `commentTemplatesEditorModelToken`, `templatesStorageModelToken` dependencies и shared `CommentsEditorPageObject` до первого `attachTools(...)`; добавить smoke/test на реальный default `globalContainer` path.

### Nit

Нет.

## Резюме

TASK-89 соответствует задаче: контейнер принимает opaque `commentEditorId`, не лезет в DOM, не вставляет текст напрямую, не вызывает Jira API, команды отправляет через `editorEntry.model`, а состояние читает через snapshots. Notification mapping остаётся UI adaptation; auto-hide cleanup и out-of-order async insert race покрыты тестами. Единственный оставшийся warning относится к будущему runtime wiring, а не к контейнерной реализации TASK-89.
