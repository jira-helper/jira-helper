# Review: TASK-99 — Diagnostic module DI wiring

**Дата**: 2026-05-19
**TASK**: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[requirements.md §5.6:324 vs §5.5]**: В §5.6 указан порядок `diagnosticModule.ensure` → infrastructure, что противоречит §5.5 и фактической реализации (infrastructure → `diagnosticModule.ensure` → остальные feature modules). Реализация в `content.ts` соответствует §5.5, TASK-99 и target-design — ок для этой задачи; при TASK legacy-callbacks уточнить docs или отложить `inject(diagnosticModelToken)` до после блока `*.ensure()`.
- **[TASK-99 / критерии приёмки]**: `npm test` / lint в ревью не прогонялись (sandbox EPERM на vite config). Перед merge — qa-check: `npm test`, `npm run lint:eslint -- --fix`.

### Nit

- **[src/features/diagnostic-module/module.test.ts]**: Можно добавить проверку `expect(model).toBeInstanceOf(DiagnosticModel)` и идемпотентность `ensure()` (двойной вызов) — не блокирует.
- **[src/content.ts:142]**: `diagnosticBoardPageToken` регистрируется среди board PageModifications, не сразу после `ensure` — соответствует п.5 TASK («как сейчас»).

## Соответствие задаче

| Пункт TASK | Статус |
|------------|--------|
| `DiagnosticModule.register()`: `lazy` + `modelEntry(new DiagnosticModel(logger))` | ✅ `module.ts:8-9` |
| Smoke test: `ensure` резолвит `diagnosticModelToken` | ✅ `module.test.ts:15-23` |
| `diagnosticModule.ensure(container)` после infrastructure, до `columnLimitsModule` | ✅ `content.ts:97-116` |
| Импорт из `diagnostic-module/module` | ✅ `content.ts:54` |
| PageModification `diagnosticBoardPageToken` в `content.ts` | ✅ `content.ts:142, 200` |

## Архитектура

- Паттерн `Module` + `lazy()` + `modelEntry()` совпадает с `column-limits-module/module.ts` и target-design § `module.ts`.
- `loggerToken` inject в factory — корректно.
- Тест регистрирует `loggerToken` в `beforeEach` — минимальная изоляция для smoke.
- Singleton: `first.model === second.model` — соответствует lazy-factory в `Module.lazy`.

## Порядок ensure в `content.ts`

```text
infrastructure DI (97–113)
  → diagnosticModule.ensure (115)     ← первый feature module
  → columnLimitsModule.ensure (116)
  → personLimitsModule, swimlane, field, histogram, cardColors, gantt, jiraCommentTemplates
```

Соответствует requirements §5.5 и target-design Migration Phase 1.

## Резюме

DI wiring выполнен по референсу и target-design: модуль минимален, тест покрывает resolve и singleton, bootstrap-order в `content.ts` корректен. Блокирующих замечаний нет; перед merge рекомендуется qa-check (test/lint).
