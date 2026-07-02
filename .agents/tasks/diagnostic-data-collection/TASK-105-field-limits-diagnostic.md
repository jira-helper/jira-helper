# TASK-105: field-limits-module diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callback для `field-limits-module`. При необходимости — `getDiagnosticSnapshot()` на RuntimeModel.

## Файлы

```
src/features/field-limits-module/
├── module.ts                         # update
├── BoardPage/models/RuntimeModel.ts  # optional getDiagnosticSnapshot
└── module.diagnostic.test.ts       # новый
```

## Что сделать

1. Register `field-limits-module` callback в `module.register()`.
2. Payload per requirements §5.
3. Unit test diagnostic callback.

## Критерии приёмки

- [x] Convention payload §5.3
- [x] Unit test diagnostic callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- В `module.ts` зарегистрирован callback `field-limits-module` через `registerDiagnosticData` (§5.3: `settings.boardProperty` с `state`/`error`/`settings`, `localStorage: null`, `runtime.stats`).
- Добавлен `module.diagnostic.test.ts`: регистрация, payload из текущего state, initial state, проверка отсутствия вызовов `recalculate()`/`initialize()`.
- `getDiagnosticSnapshot()` не потребовался — `stats` и property fields доступны read-only.

**Проблемы и решения**:

- Полный `npm test` в CI-подобном прогоне дал 1–2 flaky timeout в `CommentTemplatesSettingsContainer.test.tsx` (не связано с field-limits); изолированный прогон field-limits diagnostic и повтор flaky-теста — OK.
