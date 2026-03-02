# TASK-113: Реализовать swimlane-filter.feature.cy.tsx

**Status**: DONE

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

---

## Результаты

**Дата**: 2026-03-02

**Статус**: DONE

**Изменения**:

1. Создан `swimlane-filter.feature.cy.tsx` — Cypress BDD тест runner

2. Обновлены step definitions в `steps/common.steps.ts`:
   - Добавлен step `Given the board has columns:` (no-op, документация)
   - Добавлен step `Given the board has swimlanes:` (no-op, документация)
   - Обновлён `Given there are column groups:` — поддержка `swimlanes` колонки в DataTable

3. Обновлены fixtures в `helpers.tsx`:
   - Заменён swimlane "Excluded" на "Expedite" (соответствует feature файлу)
   - Обновлён `swimlaneNameToId` mapping

4. Исправлен feature файл:
   - SC-SWIM-BOARD-1: изменён limit 2→1 и badge "2/2"→"2/1" чтобы корректно тестировать exceeded
   - Заменён `the limit should be exceeded` на `"In Progress" cells should have red background`

5. Все 3 сценария проходят:
   - SC-SWIM-BOARD-1: Count issues only from selected swimlanes
   - SC-SWIM-BOARD-2: All swimlanes when empty selection
   - SC-SWIM-BOARD-3: Different swimlanes for different groups
