# TASK-87: Editor Model

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Реализовать `CommentTemplatesEditorModel`, который оркестрирует вставку шаблона и watcher side effects для одного live comment editor. Модель не знает DOM selectors и работает только через `CommentsEditorPageObject` и существующий `IJiraService`.

## Файлы

```
src/features/jira-comment-templates-module/Editor/models/
├── CommentTemplatesEditorModel.ts       # новый
└── CommentTemplatesEditorModel.test.ts  # новый
```

## Что сделать

1. Создать state `pendingTemplateIds` и методы `insertTemplate(request)` / `reset`.
2. Получать template из `TemplatesStorageModel` и вставлять текст через `commentsEditorPageObject.insertText(commentEditorId, text)`.
3. После успешной вставки добавлять watchers через `IJiraService.addWatcher` только если watchers не пустые и `issueKey` доступен.
4. Агрегировать watcher results в `success`, `partial`, `failed`, `skipped` без остановки на первой ошибке.
5. Покрыть unit tests successful insert, missing template, insert error, skipped watchers, success/partial/failed watcher aggregation.
6. Pending state должен корректно работать при параллельных вставках одного `templateId`.

## Критерии приёмки

- [x] Модель не читает и не мутирует Jira DOM напрямую.
- [x] Watchers вызываются только после успешной вставки текста; pending не сбрасывается преждевременно при concurrent insert того же template id.
- [x] Недоступный issue key приводит к skipped/warning результату без Jira REST calls.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-79](./TASK-79-templates-storage-model.md)
- Зависит от: [TASK-84](./TASK-84-jira-watchers-api.md)
- Зависит от: [TASK-86](./TASK-86-comments-editor-page-object.md)
- Референс: [comment-templates.feature](./comment-templates.feature)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `CommentTemplatesEditorModel.ts` и `CommentTemplatesEditorModel.test.ts`: `pendingTemplateIds`, `insertTemplate` с `try/finally` для очистки pending, нормализация watchers (trim, пустые пропускаются), ветки `skipped` (`empty-watchers`, `missing-issue-key`), последовательные `addWatcher` без short-circuit, агрегация `success` / `partial` / `failed`, `reset()` сбрасывает pending map.
- **REVIEW MISSED_SCENARIO (2026-04-30)**: для параллельных `insertTemplate` с одним `templateId` введён приватный `pendingCounts` (increment в начале, decrement в `finally`); публичный `pendingTemplateIds[id]` снимается только при нуле счётчика; `reset()` очищает и map, и счётчики; unit-тест «два in-flight, завершить первый — pending true, завершить второй — cleared».
- В тестах для `commentEditorId` используется только `toCommentEditorId` из infrastructure CommentsEditor (без re-export из feature types).

**Проблемы и решения**:

- `toHaveBeenNthCalledWith` с третьим аргументом `undefined` не совпадал с фактическим числом аргументов spy — проверки сведены к `(issueKey, username)`.

**Проверки**:

- `npm test -- --run src/features/jira-comment-templates-module/Editor/models/CommentTemplatesEditorModel.test.ts`
- `npm test -- --run` (142 файла, 1578 тестов)
- `npx eslint …CommentTemplatesEditorModel.ts …CommentTemplatesEditorModel.test.ts --fix`
