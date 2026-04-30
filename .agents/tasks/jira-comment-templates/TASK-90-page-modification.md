# TASK-90: Comment Templates PageModification

**Status**: VERIFICATION
**Type**: page-modification

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Реализовать `CommentTemplatesPageModification` как feature entry point для Jira BOARD и ISSUE routes. PageModification регистрирует settings UI и передаёт toolbar container в `CommentsEditorPageObject.attachTools`, но не сканирует DOM самостоятельно.

## Файлы

```
src/features/jira-comment-templates-module/
├── CommentTemplatesPageModification.ts       # новый
└── CommentTemplatesPageModification.test.ts  # новый
```

## Что сделать

1. Реализовать PageModification lifecycle по существующему project pattern.
2. На apply/register добавить settings tab через `registerSettings` и `registerIssueSettings` для board/issue contexts.
3. Вызвать `commentsEditorPageObject.attachTools('jira-comment-templates', CommentTemplatesToolbarContainer)`.
4. Сохранить handle и detach/unregister при cleanup lifecycle.
5. Покрыть unit tests: supported routes, settings registration, attachTools called once, detach on cleanup.

## Критерии приёмки

- [ ] PageModification не содержит selectors comment editor и не создаёт React roots напрямую.
- [ ] BOARD и ISSUE routes поддержаны, transition dialog не входит в MVP.
- [ ] Cleanup не оставляет активный observer/attach handle.
- [ ] Тесты проходят: `npm test`.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-83](./TASK-83-settings-container.md)
- Зависит от: [TASK-86](./TASK-86-comments-editor-page-object.md)
- Зависит от: [TASK-89](./TASK-89-toolbar-container.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: GPT-5.5

**Статус**: VERIFICATION

**Что сделано**:

- Реализован `CommentTemplatesPageModification` как точка интеграции toolbar/settings UI для BOARD и ISSUE lifecycle.
- Settings UI регистрируется через `registerSettings` и `registerIssueSettings`.
- Toolbar container передаётся в `CommentsEditorPageObject.attachTools` с ключом `jira-comment-templates`; cleanup вызывает `detach()` attach handle.
- Добавлен runtime DI wiring: shared `commentsEditorPageObjectToken`, `commentTemplatesEditorModelToken`, регистрация module/page modification в `content.ts`.
- Добавлены unit tests на settings registration, toolbar attachment, component container DI и cleanup.
- Review: [REVIEW-TASK-90](./REVIEW-TASK-90.md) — APPROVED.
- QA: [QA-TASK-90](./QA-TASK-90.md) — PASS.

**Проблемы и решения**:

- Интеграция выявила, что `commentTemplatesEditorModelToken` и общий `CommentsEditorPageObject` ещё не были зарегистрированы в runtime DI; wiring закрывается в рамках этой задачи, иначе `CommentTemplatesToolbarContainer` падал бы при первом render.
- `PageModification` не вызывает `module.ensure()` сам: module wiring остаётся ответственностью `content.ts`, а тесты явно подготавливают контейнер.
- Live Jira smoke на `TTP-19539` выявил runtime падение `define modificationId`: `CommentTemplatesPageModification` не переопределял `getModificationId()`. Добавлен стабильный id `jira-comment-templates` и unit test на PageModification lifecycle.
