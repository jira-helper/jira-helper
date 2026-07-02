# TASK-102: column-limits-module diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Зарегистрировать diagnostic callback для `column-limits-module` с convention payload §5.3. Unit-тест snapshot модуля.

## Файлы

```
src/features/column-limits-module/
├── module.ts                              # update register()
└── module.diagnostic.test.ts              # новый (или *.test.ts рядом)
```

## Что сделать

1. В конце `register()`: inject `diagnosticModelToken`, `propertyModelToken`, `boardRuntimeModelToken`.
2. `registerDiagnosticData('column-limits-module', ...)` — payload per requirements §5 column-limits.
3. Callback sync, side-effect free; без `load()`/`calculateStats()`.
4. Unit test: known mock state → expected `{ settings, runtime }` shape, JSON-serializable.

## Критерии приёмки

- [x] featureName = `column-limits-module`
- [x] Payload convention §5.3
- [x] Unit test diagnostic callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

---

## Результаты

**Дата**: 2026-05-20

**Агент**: feature-orchestrator (review + QA subagents)

**Статус**: DONE

**Что сделано**:

- `registerDiagnosticData('column-limits-module', …)` в `module.ts`
- `module.diagnostic.test.ts` — unit-тесты callback
- REVIEW-TASK-102.md: APPROVED; QA-TASK-102.md: PASS

**Проблемы и решения**:

- REQUIREMENTS_GAP (non-blocking): `cssNotIssueSubTask` в bullets requirements, не в payload — зафиксировано в review.

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: [developer-guide.md](./developer-guide.md), requirements §5 column-limits
