# TASK-112: Реализовать swimlane-selector.feature.cy.tsx

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Реализовать Cypress BDD тесты для UI выбора свимлейнов в SettingsPage.

## Что сделать

### 1. Создать тестовый файл

**Файл**: `src/column-limits/SettingsPage/features/swimlane-selector.feature.cy.tsx`

```tsx
import { defineFeature } from 'cypress/support/bdd-runner';
import featureFile from './swimlane-selector.feature?raw';
import { setupBackground, cleanupAfterScenario } from './helpers';
import './steps/common.steps';

defineFeature(featureFile, {
  Background: () => setupBackground(),
  afterEach: () => cleanupAfterScenario(),
});
```

### 2. Добавить step definitions

**Файл**: `src/column-limits/SettingsPage/features/steps/common.steps.ts`

Добавить step definitions для:
- `Given the board has swimlanes:`
- `Given I am on the Column Limits settings modal`
- `When I create a new group with columns {string}`
- `Given I have a group with columns {string}`
- `When I uncheck "All swimlanes" checkbox`
- `When I uncheck {string} swimlane`
- `When I check {string} swimlane`
- `Then the group should show "All swimlanes" checkbox checked`
- `Then the swimlane list should be hidden`
- `Then I should see checkboxes for each swimlane`
- `Then all individual swimlane checkboxes should be checked`
- `Then {string} and {string} should remain checked`
- `Then {string} should be unchecked`
- `Then "All swimlanes" checkbox should become checked`
- `Then the group should show {string} and {string} selected`

## Критерии приёмки

- [ ] Тестовый файл создан
- [ ] Step definitions реализованы
- [ ] 5 сценариев проходят
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-102 (feature file), TASK-109 (UI integration)
