# TASK-83: Создать helpers.tsx для Column Limits SettingsPage

**Status**: TODO

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать helpers.tsx с fixtures, mount функциями и setup для SettingsPage BDD тестов.

## Файлы

```
src/column-limits/SettingsPage/features/
├── helpers.tsx                  # новый
└── steps/
    └── common.steps.ts          # новый
```

## Что сделать

### 1. Создать `helpers.tsx`

Содержимое:
- Fixtures для columns, issueTypes
- `mountModal()` — монтирование SettingsModalContainer
- `mountButton()` — монтирование SettingsButtonContainer
- `setupBackground()` — сброс DI, stores
- Моки для DI токенов (updateBoardPropertyToken, getBoardIdFromURLToken)

### 2. Создать пустой `common.steps.ts`

```typescript
/**
 * Common step definitions for Column Limits SettingsPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';

// Steps will be added in subsequent tasks
```

## Референс

Взять за основу:
- `src/column-limits/SettingsPage/SettingsPage.feature.cy.tsx` (setup код)
- `src/person-limits/SettingsPage/features/helpers.tsx`

## Критерии приёмки

- [ ] `helpers.tsx` создан с fixtures и функциями
- [ ] `common.steps.ts` создан
- [ ] Файлы компилируются без ошибок
- [ ] Нет ошибок линтера

## Зависимости

- Референс: `src/person-limits/SettingsPage/features/helpers.tsx`
