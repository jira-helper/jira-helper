# TASK-102: column-limits-module diagnostic

**Status**: TODO
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

- [ ] featureName = `column-limits-module`
- [ ] Payload convention §5.3
- [ ] Unit test diagnostic callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: [developer-guide.md](./developer-guide.md), requirements §5 column-limits
