# TASK-89: Toolbar Container

**Status**: VERIFICATION
**Type**: container

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать `CommentTemplatesToolbarContainer`, который получает `commentEditorId` от `CommentsEditorPageObject` и подключает toolbar UI к `TemplatesStorageModel` и `CommentTemplatesEditorModel`. Container держит только UI-local notification visibility и auto-hide timeout.

## Файлы

```
src/features/jira-comment-templates-module/Editor/components/
├── CommentTemplatesToolbarContainer.tsx       # новый
├── jira-comment-templates-editor.module.css   # новый
└── CommentTemplatesToolbarContainer.test.tsx  # новый
```

## Что сделать

1. Принять `commentEditorId` в props и не вычислять его из DOM.
2. Через `useModel` читать templates/pending state и вызывать `editorModel.insertTemplate({ commentEditorId, templateId })`.
3. Преобразовать `InsertTemplateResult` / watcher aggregation в notification props.
4. Реализовать auto-hide notification через 5 секунд и manual dismiss.
5. Покрыть test template click forwarding, notification rendering/auto-hide и disabled pending state.

## Критерии приёмки

- [x] Container не ищет editor DOM и не вставляет текст напрямую.
- [x] Notification появляется в правом верхнем углу и скрывается через 5 секунд.
- [x] Save settings обновляет toolbar через shared `TemplatesStorageModel` state без reload.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-87](./TASK-87-editor-model.md)
- Зависит от: [TASK-88](./TASK-88-toolbar-ui.md)
- Зависит от: [TASK-95](./TASK-95-toolbar-notification-view.md)
- Референс: `docs/component-containers.md`

---

## Результаты

**Дата**: _ожидает выполнения_

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `CommentTemplatesToolbarContainer`: принимает opaque `commentEditorId`, inject-ит `TemplatesStorageModel` и `CommentTemplatesEditorModel`, читает snapshots через `useModel`, вызывает command на `entry.model.insertTemplate`.
- Container держит только UI-local notification state: manual dismiss, auto-hide через 5 секунд, cleanup timer on unmount.
- Добавлен mapping `InsertTemplateResult` / `AddWatchersResult` → `CommentTemplatesNotificationState` для success/partial/failed/missing issue key; empty watcher list не показывает watcher notification.
- Добавлены i18n texts для toolbar manage/dismiss и watcher notification copy.
- Добавлены styles для контейнера и top-right notification slot.
- Добавлены component tests: click forwarding, partial notification + auto-hide, manual dismiss, pending disabled state, shared storage reactivity, initial storage load.

**Проблемы и решения**:

- `onOpenSettings` оставлен optional prop: `CommentsEditorPageObject` передаёт только `commentEditorId`, а будущий PageModification может передать wrapped component с opener; без opener manage button остаётся no-op, но не блокирует insertion path.
- Container self-wraps `WithDi` with `globalContainer` by default because `CommentsEditorPageObject` mounts tools as independent React roots; tests pass explicit `Container`.
- Code review: [REVIEW-TASK-89](./REVIEW-TASK-89.md) — APPROVED; fixed warnings for snapshot `loadState` and async notification race. Remaining warning: runtime DI wiring is outside TASK-89 scope.
- QA: [QA-TASK-89](./QA-TASK-89.md) — PASS.
- Проверки: `npm run lint:eslint -- --fix`, `npm test` (145 files, 1598 tests), `npm run build:dev`.
