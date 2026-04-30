# TASK-91: Content DI Integration

**Status**: VERIFICATION
**Type**: di-wiring

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Подключить feature module, shared PageObject и LocalStorageService к runtime DI/content lifecycle. Это отдельная integration-задача, чтобы не смешивать wiring с реализацией моделей, PageObject или UI.

## Файлы

```
src/
├── content.ts                                           # изменение
├── features/jira-comment-templates-module/index.ts      # новый
└── infrastructure/page-objects/CommentsEditor/index.ts  # изменение
```

## Что сделать

1. Экспортировать feature public API через `jira-comment-templates-module/index.ts`.
2. Зарегистрировать `jiraCommentTemplatesModule.ensure(container)` в `initDiContainer()`.
3. Зарегистрировать `localStorageServiceToken`, shared `CommentsEditorPageObject` и `jiraCommentTemplatesPageModificationToken` в DI.
4. Добавить PageModification только для `Routes.BOARD` и `Routes.ISSUE`.
5. Проверить, что `TASK-74` transition dialog research не используется как MVP dependency.

## Критерии приёмки

- [ ] Feature включается через существующий content/DI lifecycle.
- [ ] PageModification зарегистрирован только для BOARD/ISSUE routes.
- [ ] DI wiring не создаёт дубликаты models/services при repeated init.
- [ ] Тесты проходят: `npm test`.
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-76](./TASK-76-module-tokens-skeleton.md)
- Зависит от: [TASK-77](./TASK-77-local-storage-service.md)
- Зависит от: [TASK-90](./TASK-90-page-modification.md)
- Референс: `src/content.ts`

---

## Результаты

**Дата**: 2026-04-30

**Агент**: GPT-5.5

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен public API `jira-comment-templates-module/index.ts`.
- `content.ts` подключает `jiraCommentTemplatesModule.ensure(container)`, shared `CommentsEditorPageObject`, `LocalStorageService` и `jiraCommentTemplatesPageModificationToken`.
- `CommentTemplatesPageModification` добавлен только в `Routes.BOARD` и `Routes.ISSUE`.
- Review: [REVIEW-TASK-91](./REVIEW-TASK-91.md) — APPROVED.
- QA: [QA-TASK-91](./QA-TASK-91.md) — PASS.

**Проблемы и решения**:

- Часть wiring была выполнена в `TASK-90`, потому что без неё PageModification нельзя было проверить end-to-end в unit/build. В `TASK-91` wiring доведён до полного runtime набора, включая `localStorageServiceToken` и public exports.
