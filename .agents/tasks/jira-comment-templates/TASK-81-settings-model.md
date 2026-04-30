# TASK-81: Settings Model

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Реализовать `CommentTemplatesSettingsModel` для draft lifecycle настроек шаблонов. Модель управляет add/edit/delete/import/export/reset/save/discard и сохраняет данные только через `TemplatesStorageModel`.

## Файлы

```
src/features/jira-comment-templates-module/Settings/models/
├── CommentTemplatesSettingsModel.ts       # новый
└── CommentTemplatesSettingsModel.test.ts  # новый
```

## Что сделать

1. Создать Valtio state: `draftTemplates`, `validationErrors`, `importError`, `isSaving`, `isDirty`.
2. Реализовать `initDraft`, `addTemplate`, `updateTemplate`, `deleteTemplate`, `discardDraft`, `resetDraftToDefaults`.
3. Реализовать `importFromJsonText` так, чтобы импорт заменял только draft.
4. Реализовать `buildExportJson` и `saveDraft` через `TemplatesStorageModel.saveTemplates`.
5. Покрыть unit tests draft init, CRUD, legacy import, invalid import, save, discard и reset.
6. Не позволять сохранять пустой draft; после успешного save синхронизировать draft с persisted normalized state; не сбрасывать `isDirty` если draft изменился во время async save.

## Критерии приёмки

- [x] Import не сохраняет данные до явного `saveDraft`.
- [x] Save валидирует draft, reject empty draft, пишет через `TemplatesStorageModel` и корректно обрабатывает in-flight edits.
- [x] Reset работает как draft action и не скрывает ошибки импорта некорректно.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: [TASK-79](./TASK-79-templates-storage-model.md)
- Зависит от: [TASK-80](./TASK-80-settings-import-export-utils.md)
- Референс: [requirements.md](./requirements.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `CommentTemplatesSettingsModel` и `CommentTemplatesSettingsModel.test.ts`: контракт `ICommentTemplatesSettingsModel`, DI только через `ITemplatesStorageModel`.
- Локальные помощники `cloneTemplatesToEditable` и `validateDraftTemplates` (required label/color/text после trim; форма watchers).
- Импорт через `validateImportedTemplates` без вызова storage; экспорт через `serializeTemplates` после валидации драфта.
- `resetDraftToDefaults` подставляет `DEFAULT_COMMENT_TEMPLATES` в draft без записи в storage.
- **Post-review (REVIEW-TASK-81)**: счётчик `draftRevision` (без `#private` — совместимость с Valtio `proxy`); при успешном `saveDraft` с той же ревизией драфт пересобирается из `storageModel.templates`; при изменении драфта во время in-flight save `isDirty` не сбрасывается; пустой список шаблонов отклоняется в `validateDraftTemplates` с `field: 'file'`; stub storage в тестах применяет `normalizeTemplates` как реальный `saveTemplates`.

**Проблемы и решения**:

- В тестовом stub для storage первоначально была рекурсия при моке `saveTemplates` — переименован мок в `saveTemplatesMock` и вынесен вызов `vi.fn` отдельно.
- Первая версия теста `initDraft` ожидала `isDirty=false` после правки драфта — исправлен порядок assertion (после `initDraft` dirty сброшен, после `updateTemplate` — грязный).
- True private fields (`#draftRevision`) ломают `proxy(new CommentTemplatesSettingsModel(...))` — заменено на `private draftRevision` (TS-only) с комментарием в коде.

**Проверки**:

- `npx vitest run src/features/jira-comment-templates-module/Settings/models/CommentTemplatesSettingsModel.test.ts` — OK (19 tests).
- `npx eslint …CommentTemplatesSettingsModel.ts …CommentTemplatesSettingsModel.test.ts --fix` — OK.
- `npm test -- --run` — OK (139 files / 1536 tests).
