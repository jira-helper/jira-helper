# TASK-85: Comments Editor PageObject Contract

**Status**: VERIFICATION
**Type**: page-object

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать shared contract для `CommentsEditorPageObject`, который будет использоваться фичей и будущими инструментами comment editor. Контракт должен скрывать DOM selectors и отдавать feature-компонентам только opaque `commentEditorId`.

## Файлы

```
src/infrastructure/page-objects/CommentsEditor/
├── ICommentsEditorPageObject.ts  # новый
└── index.ts                      # новый
```

## Что сделать

1. Описать `CommentEditorId`, `CommentEditorKind`, `CommentFormDomTarget`, `CommentEditorToolProps` и `CommentEditorToolComponent`.
2. Описать `ICommentsEditorPageObject` с `selectors`, `attachTools(key, Component)` и `insertText(commentEditorId, text)`.
3. Описать `AttachCommentToolsHandle` и `InsertTextIntoCommentEditorResult`.
4. Экспортировать contract через `index.ts`.
5. Не реализовывать DOM scan, MutationObserver или React root lifecycle в этой задаче.
6. Не реэкспортировать runtime helper `toCommentEditorId` из feature-level `types.ts`; minting editor ids остается ответственностью infrastructure PageObject.

## Критерии приёмки

- [x] Contract не раскрывает DOM nodes feature-level компонентам.
- [x] `commentEditorId` является opaque handle, а не selector или issue key; feature-level API не предоставляет helper для minting id (`toCommentEditorId` только infrastructure PageObject/tests).
- [x] `attachTools` contract документирует idempotent lifecycle: один активный registration на `key`, повторный attach с тем же `key` не дублирует toolbar; `detach` только для своего handle и безопасен после повторного вызова.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-75](./TASK-75-domain-types-and-constants.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION (SCOPE_DRIFT из REVIEW-TASK-85 закрыт)

**Что сделано**:

- Добавлены `src/infrastructure/page-objects/CommentsEditor/ICommentsEditorPageObject.ts` и `index.ts`: контракт `ICommentsEditorPageObject` с `CommentsEditorSelectors`, `attachTools` (JSDoc: одна регистрация на `key`, без дубликата toolbar при повторном attach; `detach` только для своего handle), `insertText`; opaque `CommentEditorId` и **`toCommentEditorId` только в infrastructure** (JSDoc: implementation/tests, не граница фичи); `CommentEditorKind`; `CommentFormKind` и `CommentFormDomTarget` без DOM-узлов; `CommentEditorToolProps` / `CommentEditorToolComponent`; `InsertTextIntoCommentEditorResult`; `AttachCommentToolsHandle` с идемпотентным `detach`.
- `types.ts` фичи: **type-only** реэкспорт `CommentEditorId`, `CommentEditorKind`, `CommentEditorInsertResult` из infrastructure (без `toCommentEditorId`).

**Проблемы и решения**:

- В `target-design.md` в черновом контракте у `CommentFormDomTarget` был `root: HTMLElement`. По TASK-85 контракт намеренно без узлов на границе фичи; корень остаётся внутренностью PageObject (TASK-86). Разведены `CommentEditorKind` (контрол) и `CommentFormKind` (маршрут/форма).

**Проверки**:

- `npm run lint:eslint -- …CommentsEditor… types.ts --fix` (post-review)
- `npm test -- --run` по необходимости
