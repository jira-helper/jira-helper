# TASK-106: card-colors-module diagnostic

**Status**: DONE
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

- [x] Runtime snapshot read-only
- [x] Unit test diagnostic callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 card-colors

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `RuntimeModel.getDiagnosticSnapshot()` — `isActive`, `error`, `intervalActive` (без DOM/private).
- В `module.ts` зарегистрирован callback `card-colors-module` (§5.3: `settings.boardProperty` + `runtime`).
- `RuntimeModel.test.ts` — unit-тесты snapshot (default, error, interval, deactivate, disabled).
- `module.diagnostic.test.ts` — регистрация, payload без side effects, initial state.

**Проблемы и решения**:

- `module.test.ts` падал без `diagnosticModule.ensure` — добавлен в `beforeEach`, как в `module.diagnostic.test.ts`.
- Полный `npm test`: 2 flaky timeout в `jira-comment-templates-module` (не связано с card-colors); все 25 тестов `card-colors-module` — OK. ESLint — OK.
