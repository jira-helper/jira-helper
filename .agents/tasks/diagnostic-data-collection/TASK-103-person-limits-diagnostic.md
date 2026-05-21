# TASK-103: person-limits-module diagnostic

**Status**: DONE
**Type**: model

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callback для `person-limits-module` + обязательный `getDiagnosticSnapshot()` на BoardRuntimeModel (без DOM refs).

## Файлы

```
src/features/person-limits-module/
├── module.ts                                    # update
├── BoardPage/models/BoardRuntimeModel.ts        # getDiagnosticSnapshot
├── BoardPage/models/BoardRuntimeModel.test.ts   # extend
└── module.diagnostic.test.ts                    # новый
```

## Что сделать

1. Добавить `getDiagnosticSnapshot(): FeatureDiagnosticData` на runtime model — без `Element[]`, только aggregates.
2. Register callback `person-limits-module` в `module.register()`.
3. Payload: settings.boardProperty + runtime from snapshot (requirements §5).
4. Unit tests: snapshot + diagnostic callback.

## Критерии приёмки

- [x] `getDiagnosticSnapshot` не возвращает DOM
- [x] Diagnostic callback unit test
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `BoardRuntimeModel.getDiagnosticSnapshot()` — агрегаты `activePerson`, `swimlanesActive`, `cssSelectorOfIssues`, `limits[]` с `issuesCount`/`isOverLimit` (без `Element[]`)
- Регистрация `registerDiagnosticData('person-limits-module', …)` в `module.register()` (§5.3 payload)
- Unit-тесты: `BoardRuntimeModel.test.ts` (snapshot), `module.diagnostic.test.ts` (callback)
- В тестах DI добавлен `diagnosticModule.ensure` перед `personLimitsModule.ensure` (как в column-limits)

**Проблемы и решения**:

- После регистрации diagnostic callback 23 теста падали с «Token is not registered» — в setup тестов person-limits добавлен `diagnosticModule.ensure(container)` по образцу TASK-102.

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 person-limits
