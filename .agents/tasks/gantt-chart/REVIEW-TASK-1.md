# Review: TASK-1 — Типы домена и DI-токены Gantt

**Дата**: 2026-04-13
**TASK**: [TASK-1](./TASK-1-types-and-tokens.md)
**Вердикт**: **APPROVED**

## Findings

### Critical

Нет.

### Warning

1. **[tokens.ts]**: Плейсхолдер-интерфейсы — заменить на `import type` при реализации моделей (TASK-4/14/20).
2. **[types.ts:47-50]**: Неопределённая формулировка в JSDoc `issueLinkTypesToInclude`. Заменить на `Empty array means "all link types" (no restriction).`

### Nit

1. **[types.ts:13]**: Добавить `@example` блоки к `DateMapping`.
2. **[types.ts:36-37]**: Добавить JSDoc к `labelFieldId` и `tooltipFieldIds`.
3. **[types.ts:39]**: Добавить `null = no filter` к `exclusionFilter`.

## Резюме

Код чистый, покрывает все типы из target-design. FR-5 поля корректны. Ре-экспорт IssueLinkTypeSelection — правильно. Замечания минорные.
