# TASK-101: Export payload integration test

**Status**: TODO
**Type**: other

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Integration/unit test полного export payload: backward compat legacy fields + additive `featureDiagnostics`, fallback при broken aggregate stringify.

## Файлы

```
src/features/diagnostic-module/models/
└── DiagnosticModel.test.ts   # расширить
```

## Что сделать

1. Test `buildExportPayload()`: все 5 legacy keys присутствуют и typed correctly.
2. Test: `featureDiagnostics` populated when callbacks registered.
3. Test: fallback export без `featureDiagnostics` при simulate aggregate stringify failure.
4. Mock `window`, `document`, `Logger` — без real DOM download в тестах.

## Критерии приёмки

- [ ] Backward compat export shape зафиксирован тестом
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-98](./TASK-98-diagnostic-model.md)
