# TASK-82: Settings UI Shell Views

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать presentation-компоненты Settings UI для списка и редактирования шаблонов. Компоненты принимают props, показывают draft и validation errors, пробрасывая user actions наружу без доступа к Models или storage.

## Файлы

```
src/features/jira-comment-templates-module/Settings/components/
├── CommentTemplatesSettings.tsx       # новый
├── TemplateEditorRow.tsx              # новый
└── CommentTemplatesSettings.test.tsx  # новый
```

## Что сделать

1. Реализовать `CommentTemplatesSettings` с layout, draft list и actions add/delete/reset/save/discard.
2. Реализовать `TemplateEditorRow` для label/color/text/watchers с доступными labels и keyboard-friendly controls.
3. Подготовить slot/props для отдельного import/export controls компонента из [TASK-94](./TASK-94-settings-import-export-controls.md).
4. Отобразить validation errors и import error через props.
5. Не подключать `useModel`, DI, `localStorage` или FileReader business logic в View.
6. Покрыть View test rendering draft rows, edit/delete callbacks и validation errors.

## Критерии приёмки

- [x] View-компоненты полностью controlled через props.
- [x] Import/export controls подключаются как отдельный View-компонент, без parse/save логики в shell.
- [x] UI содержит доступные labels/focusable controls для основных действий.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-81](./TASK-81-settings-model.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: _ожидает выполнения_

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `CommentTemplatesSettings` и `TemplateEditorRow` как pure controlled View components.
- Добавлен `importExportControls` slot для будущего `TemplateImportExportControls` из TASK-94 без parsing/FileReader/storage logic в shell.
- Добавлены доступные labels для label/color/text/watchers, save/discard/reset/add/delete actions, validation/import errors.
- Добавлен `jira-comment-templates-settings.module.css` для shell/rows/errors.
- Добавлены component tests: draft rows rendering, import/export slot, field edit patches, row/shell callbacks, validation/import errors, saving disabled state, empty state.

**Проблемы и решения**:

- Props расширены `labels` объектом, чтобы View не хардкодил user-facing copy и будущий container мог передать i18n texts.
- Watchers textarea отдаёт `watchers: string[]` через split by newline as UI field adaptation; trimming/validation остаются в model/utils.
- Code review: [REVIEW-TASK-82](./REVIEW-TASK-82.md) — APPROVED без findings.
- QA: [QA-TASK-82](./QA-TASK-82.md) — PASS.
- Проверки: `npm run lint:eslint -- --fix`, `npm test` (146 files, 1604 tests), `npm run build:dev`.
