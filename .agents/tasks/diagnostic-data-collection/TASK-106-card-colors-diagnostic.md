# TASK-106: card-colors-module diagnostic

**Status**: TODO
**Type**: model

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callback для `card-colors-module` + обязательный read-only runtime snapshot getter.

## Файлы

```
src/features/card-colors-module/
├── module.ts                              # update
├── BoardPage/models/RuntimeModel.ts       # getDiagnosticSnapshot
├── BoardPage/models/RuntimeModel.test.ts  # extend
└── module.diagnostic.test.ts              # новый
```

## Что сделать

1. `getDiagnosticSnapshot()` на RuntimeModel: `isActive`, `error`, `intervalActive` — без private fields/commands.
2. Register `card-colors-module` callback.
3. Unit tests snapshot + callback.

## Критерии приёмки

- [ ] Runtime snapshot read-only
- [ ] Unit test diagnostic callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 card-colors
