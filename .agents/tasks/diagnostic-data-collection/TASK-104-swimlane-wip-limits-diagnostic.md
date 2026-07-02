# TASK-104: swimlane-wip-limits-module diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callback для `swimlane-wip-limits-module`. При необходимости — `getDiagnosticSnapshot()` на BoardRuntimeModel.

## Файлы

```
src/features/swimlane-wip-limits-module/
├── module.ts                         # update
├── BoardPage/models/BoardRuntimeModel.ts   # optional getDiagnosticSnapshot
└── module.diagnostic.test.ts       # новый
```

## Что сделать

1. Register `swimlane-wip-limits-module` callback в `module.register()`.
2. Payload per requirements §5 (settings + runtime stats).
3. Добавить `getDiagnosticSnapshot()` если прямое чтение runtime unsafe.
4. Unit test diagnostic callback.

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

- Зарегистрирован `registerDiagnosticData('swimlane-wip-limits-module', …)` в `module.ts` (closure над `propertyModel` + `boardRuntimeModel`).
- Payload §5.3: `settings.boardProperty` — `{ state, error, settings }`; `localStorage: null`; `runtime.stats` — read-only snapshot без `render()`/`load()`.
- Добавлен `module.diagnostic.test.ts` (3 теста: регистрация, loaded state, initial state).
- В `module.test.ts` добавлен `diagnosticModule.ensure(container)` для DI bootstrap.

**Проблемы и решения**:

- `module.test.ts` падал без `diagnosticModule.ensure` — добавлен ensure в `beforeEach`, по аналогии с column-limits/person-limits.
- `getDiagnosticSnapshot()` не потребовался: `stats` и `propertyModel.settings` безопасно читаются напрямую.
