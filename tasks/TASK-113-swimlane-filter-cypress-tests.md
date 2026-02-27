# TASK-113: Реализовать swimlane-filter.feature.cy.tsx

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Реализовать Cypress BDD тесты для логики фильтрации по свимлейнам на BoardPage.

## Что сделать

### 1. Создать тестовый файл

**Файл**: `src/column-limits/BoardPage/features/swimlane-filter.feature.cy.tsx`

```tsx
import { defineFeature } from 'cypress/support/bdd-runner';
import featureFile from './swimlane-filter.feature?raw';
import { setupBackground, cleanupAfterScenario } from './helpers';
import './steps/common.steps';

defineFeature(featureFile, {
  Background: () => setupBackground(),
  afterEach: () => cleanupAfterScenario(),
});
```

### 2. Обновить step definitions

**Файл**: `src/column-limits/BoardPage/features/steps/common.steps.ts`

Обновить существующий step:

```typescript
// Обновить "Given there are column groups:" чтобы поддерживать swimlanes колонку
Given(/^there are column groups:$/, (dataTable: DataTableRows) => {
  const groups = dataTable.slice(1).map(row => {
    const [name, columnsStr, limitStr, color, issueTypesStr, swimlanesStr] = row;
    // ... parse swimlanes
    const swimlanes = swimlanesStr?.trim()
      ? swimlanesStr.split(',').map(s => {
          const trimmed = s.trim();
          return { id: swimlaneNameToId[trimmed], name: trimmed };
        })
      : undefined;
    
    return {
      // ... other fields
      swimlanes,
    };
  });
  // ...
});
```

### 3. Обновить DataTable format

Добавить колонку `swimlanes` в формат:

```gherkin
Given there are column groups:
  | name | columns     | limit | color | issueTypes | swimlanes         |
  | Dev  | In Progress | 2     |       |            | Frontend, Backend |
```

## Критерии приёмки

- [ ] Тестовый файл создан
- [ ] Step definitions обновлены для swimlanes
- [ ] 3 сценария проходят
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-103 (feature file), TASK-110 (calculateGroupStats)
