# TASK-103: person-limits-module diagnostic

**Status**: TODO
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

- [ ] `getDiagnosticSnapshot` не возвращает DOM
- [ ] Diagnostic callback unit test
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 person-limits
