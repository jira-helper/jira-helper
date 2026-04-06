# Review: TASK-180 — PropertyModel + PropertyModel.test.ts

**Дата**: 2026-04-05
**TASK**: [TASK-180](./TASK-180-property-model.md)
**Вердикт**: **CHANGES_REQUESTED**

## Findings

### Critical

1. **[PropertyModel.ts:1] Missing `Result` type import**

   Файл использует `Result<WipLimitsProperty, Error>` и `Result<void, Error>` как return type, но импортирует только `{ Ok, Err }`. Без import `Result` tsc не скомпилирует файл.

   - **Предложение**: `import { Result, Ok, Err } from 'ts-results';`

### Warning

1. **[PropertyModel.ts:75-77] `setData` не обновляет `state`**

   Когда `setData` вызывается из PageModification, `state` остаётся `'initial'`. В legacy `loadProperty.ts` после `setData` вызывался `setState('loaded')`. Если downstream-код проверяет `model.state === 'loaded'`, это баг.

   - **Предложение**: добавить `this.state = 'loaded';` в `setData`, либо JSDoc-комментарий.

2. **[PropertyModel.test.ts] Тесты не используют AAA-комментарии**

   Референсы (`swimlane-wip-limits`) используют `// Arrange`, `// Act`, `// Assert`. Для единообразия добавить.

### Nit

1. **[PropertyModel.test.ts:75-93] Idempotent load — нет assert на return value `load2`**

## Чек-лист

| Критерий | Статус |
|---|---|
| `PropertyModel` соответствует контракту | Partially (missing Result import) |
| Использует `BOARD_PROPERTIES.WIP_LIMITS_SETTINGS` | OK |
| Тесты покрывают happy path + ошибки | OK |
| `property/index.ts` экспортирует модель | OK |
