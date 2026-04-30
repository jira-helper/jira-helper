# TASK-95: Toolbar Notification View

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать presentation-компонент watcher notification для toolbar. Компонент отображает success, warning и error состояния, но не владеет auto-hide timeout и не агрегирует watcher results.

## Файлы

```
src/features/jira-comment-templates-module/Editor/components/
├── CommentTemplatesNotification.tsx       # новый
└── CommentTemplatesNotification.test.tsx  # новый
```

## Что сделать

1. Реализовать `CommentTemplatesNotification` с levels `success`, `warning`, `error`.
2. Показать message и optional details для partial/failed watcher results.
3. Добавить dismiss button с accessible label и callback `onDismiss`.
4. Поддержать `null`/empty state через родительский container, не создавая side effects в View.
5. Покрыть test rendering levels, details и dismiss callback.

## Критерии приёмки

- [x] Компонент не содержит timers и не вызывает models/Jira API.
- [x] Success/warning/error states визуально различимы и доступны.
- [x] Unit/component test покрывает levels, details и dismiss.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-87](./TASK-87-editor-model.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: _ожидает выполнения_

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `CommentTemplatesNotification` как pure View без timers, DI, models и Jira API.
- Добавлены success/warning/error visual states через CSS module; error рендерится как `role="alert"`, остальные состояния как `role="status"`.
- Добавлен dismiss button с `dismissButtonLabel` prop для i18n-friendly accessible label и callback `onDismiss(notification.id)`.
- Добавлены component tests на levels/live-region semantics, details, dismiss и `null` state.

**Проблемы и решения**:

- Target design содержит старый sketch с `autoHideMs`, но TASK-95 явно запрещает View владеть auto-hide timeout. Реализовано по TASK-95: auto-hide остаётся ответственностью будущего container.
- Добавлен обязательный `dismissButtonLabel` prop, чтобы не хардкодить пользовательскую строку в View.
- Code review: [REVIEW-TASK-95](./REVIEW-TASK-95.md) — APPROVED без findings.
- QA: [QA-TASK-95](./QA-TASK-95.md) — PASS.
- Проверки: `npm run lint:eslint -- --fix`, `npm test` (144 files, 1591 tests), `npm run build:dev`.
