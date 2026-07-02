# TASK-86: Comments Editor PageObject

**Status**: VERIFICATION
**Type**: page-object

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Реализовать shared `CommentsEditorPageObject` для обнаружения Jira comment forms, idempotent attachment toolbar tools и вставки текста. PageObject владеет selectors, marker attributes, private target registry, React root lifecycle и issue-key lookup delegation.

## Файлы

```
src/infrastructure/page-objects/CommentsEditor/
├── CommentsEditorPageObject.ts       # новый
└── CommentsEditorPageObject.test.ts  # новый
```

## Что сделать

1. Реализовать `attachTools(key, Component)` с initial scan и `MutationObserver` для supported comment blocks.
2. Добавлять marker attributes `data-jira-helper-tool` и `data-jira-helper-comment-editor-id`, чтобы не дублировать toolbar.
3. Монтировать React root в найденную mount point и корректно unmount при исчезновении блока.
4. Реализовать `insertText(commentEditorId, text)` для `textarea#comment`, `.jira-wikifield`, `#comment-wiki-edit`, `rich-editor` с input/change events где нужно.
5. Делегировать issue key lookup существующим issue/board page objects; если key недоступен, возвращать `issueKey: null`.
6. Discovery должен считать `.jira-wikifield` / `#comment-wiki-edit` поддержанными editor surfaces даже без `textarea#comment` / `rich-editor`.

## Критерии приёмки

- [x] Повторные DOM-мутации не создают дубликаты toolbar.
- [x] Исчезнувшие comment blocks очищают React roots и registry.
- [x] Toolbar не монтируется и снимается, если comment editor скрыт.
- [x] Insertion возвращает `Err(Error)`, если editor disappeared или не найден.
- [x] Transition dialog не включён в MVP behavior.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-85](./TASK-85-comments-editor-contract.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Реализован `CommentsEditorPageObject` (`attachTools`, `insertText`, registry, `MutationObserver` на `document.body`).
- Обнаружение поддержанных форм через ту же логику, что и вставка: `resolveInsertSurface` (включая wiki-only `.jira-wikifield` / `#comment-wiki-edit`; учёт `contenteditable` по атрибуту, не только `isContentEditable`).
- Формы внутри `[role="dialog"]`, `.aui-dialog2`, `.jira-dialog`, `.aui-dialog` пропускаются.
- `insertText` возвращает `issueKey`: сначала `IssueViewPageObject.getIssueKey()`, затем опционально `BoardPagePageObject.getSelectedIssueKey?.()`; при отсутствии — `null`. Конструктор принимает `Pick<IIssueViewPageObject,'getIssueKey'>` и `Pick<IBoardPagePageObject,'getSelectedIssueKey'>`, по умолчанию живые `IssueViewPageObject` и `BoardPagePageObject`.
- `IssueViewPageObject`: `getIssueKey()` из `#key-val` и/или `/browse/` · `/jira/browse/` URL.
- `IBoardPagePageObject`: опциональный `getSelectedIssueKey?()` — `selectedIssue` + `view`/`modal`, fallback `#ghx-detail-view` / `.ghx-issue-compact` с `[data-issue-key]`.
- Маркеры и `flushSync` для render/unmount без `act`; экспорт `defaultGetIssueKeyFromWindow` удалён из Comments Editor (URL-логика перенесена в page objects).

**Review fix (REVIEW-TASK-86, BLOCKED_BY_DESIGN → закрыто)**:

- Wiki-only discovery и тесты mount + insert для `.jira-wikifield` и `#comment-wiki-edit`.
- Делегирование ключа через page objects, без прямого `window.location` в `CommentsEditorPageObject`.
- Тесты: `IssueViewPageObject.getIssueKey`, `BoardPagePageObject.getSelectedIssueKey`, приоритет issue над board, dialog shells `.jira-dialog` / `.aui-dialog`, после `remove` + microtask — toolbar исчез, `insertText` даёт `Err`.

**Проблемы и решения**:

- В happy-dom `#comment-wiki-edit` с `contenteditable="true"` не всегда даёт `isContentEditable === true` — в `resolveInsertSurface` добавлена проверка атрибута `contenteditable`.
- Live Jira smoke на `TTP-19539` выявил, что toolbar виден до открытия comment editor. `resolveInsertSurface` теперь учитывает `display:none` / `visibility:hidden|collapse` / `hidden` / `aria-hidden` на surface и предках, а `MutationObserver` следит за `style`, `class`, `hidden`, `aria-hidden` и снимает mount при скрытии editor.

**Проверки**: `npm test -- --run` (все файлы), `npx eslint` на изменённые файлы (без новых ошибок; в `BoardPage.test.ts` остаётся существующее предупреждение `@typescript-eslint/no-explicit-any` на другой строке). Дополнительно для hidden-editor fix: `npx eslint src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.ts src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.test.ts --fix`, `npx vitest run src/infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject.test.ts`, `npm run build`, live smoke на `https://jira.tcsbank.ru/browse/TTP-19539`.
