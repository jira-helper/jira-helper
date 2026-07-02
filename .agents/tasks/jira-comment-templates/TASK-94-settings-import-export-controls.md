# TASK-94: Settings Import Export Controls

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать presentation-компонент import/export controls для Settings UI. Компонент отвечает только за выбор файла, кнопку экспорта и отображение import error; чтение файла, parsing и persistence остаются в container/model.

## Файлы

```
src/features/jira-comment-templates-module/Settings/components/
├── TemplateImportExportControls.tsx       # новый
└── TemplateImportExportControls.test.tsx  # новый
```

## Что сделать

1. Реализовать `TemplateImportExportControls` с file input, export button и disabled/importing states.
2. Передавать file object наружу через `onImportFileSelected(file)`.
3. Передавать export action через `onExport`.
4. Отобразить `importError` через props без попытки валидировать JSON.
5. Покрыть test file selection callback, export callback, disabled state и error rendering.

## Критерии приёмки

- [x] Компонент не читает файл и не парсит JSON.
- [x] Import и export actions доступны с клавиатуры и имеют понятные labels.
- [x] Unit/component test покрывает основные callbacks и error state.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-82](./TASK-82-settings-ui-views.md)
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: _ожидает выполнения_

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `TemplateImportExportControls`: file input, export button, importing/disabled state и import error rendering.
- Компонент передаёт наружу только `File` object и `onExport`, без чтения файла, JSON parsing или persistence.
- Labels приходят через props для будущего i18n container.
- Добавлены component tests на file selection callback, export callback, importing disabled state, parent disabled state и error rendering.

**Проблемы и решения**:

- В file input после выбора очищается `event.target.value`, чтобы пользователь мог выбрать тот же файл повторно.
- Code review: [REVIEW-TASK-94](./REVIEW-TASK-94.md) — APPROVED без findings.
- QA: [QA-TASK-94](./QA-TASK-94.md) — PASS.
- Проверки: `npm run lint:eslint -- --fix`, `npm test` (147 files, 1609 tests), `npm run build:dev`.
