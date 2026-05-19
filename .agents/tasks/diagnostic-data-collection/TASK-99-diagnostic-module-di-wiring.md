# TASK-99: Diagnostic module DI wiring

**Status**: TODO
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Создать `module.ts` для diagnostic-module и подключить `diagnosticModule.ensure(container)` в `content.ts` **первым среди feature-модулей**.

## Файлы

```
src/features/diagnostic-module/
├── module.ts       # новый
└── module.test.ts  # новый

src/content.ts      # update ensure order
```

## Что сделать

1. `DiagnosticModule.register()`: lazy `diagnosticModelToken` → `modelEntry(new DiagnosticModel(logger))`.
2. Smoke test: module.ensure резолвит `diagnosticModelToken`.
3. В `content.ts`: `diagnosticModule.ensure(container)` сразу после infrastructure DI, **до** `columnLimitsModule.ensure`.
4. Импорт `diagnosticModule` из `diagnostic-module/module`.
5. PageModification для diagnostic board page — register в content.ts как сейчас (token из tokens.ts).

## Критерии приёмки

- [ ] `diagnosticModelToken` резолвится после ensure
- [ ] Порядок ensure соответствует requirements §5.5
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-98](./TASK-98-diagnostic-model.md)
- Референс: `src/features/column-limits-module/module.ts`
