# TASK-104: swimlane-wip-limits-module diagnostic

**Status**: TODO
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

- [ ] Convention payload §5.3
- [ ] Unit test diagnostic callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
