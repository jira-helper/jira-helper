# TASK-74: Создать limit-scope.feature и step definitions для BoardPage

**Status**: TODO

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Создать feature файл для сценариев фильтрации лимитов по колонкам, свимлейнам и типам задач (SC-SCOPE-1 — SC-SCOPE-4).

## Файлы

```
src/person-limits/BoardPage/features/
├── limit-scope.feature          # новый - 4 сценария
├── limit-scope.feature.cy.tsx   # новый - ~16 строк
└── steps/
    └── common.steps.ts          # обновить - добавить степы
```

## Сценарии (4)

| ID | Название |
|----|----------|
| SC-SCOPE-1 | Limit applies to specific columns only |
| SC-SCOPE-2 | Limit applies to specific swimlanes only |
| SC-SCOPE-3 | Limit applies to specific issue types only |
| SC-SCOPE-4 | Limit with combined filters (columns + swimlanes + types) |

## Что сделать

### 1. Создать `limit-scope.feature`

```gherkin
Feature: Personal WIP Limits on Board - Limit Scope

  Фильтрация WIP-лимитов по колонкам, свимлейнам и типам задач.
  Лимит может применяться только к определённым колонкам,
  определённым свимлейнам или определённым типам задач.

  @SC-SCOPE-1
  Scenario: Limit applies to specific columns only
    Given a WIP limit: login "john.doe" name "John Doe" value 2 columns "In Progress" swimlanes "all" issueTypes "all"
    And "john.doe" has 1 issue in column "To Do"
    And "john.doe" has 3 issues in column "In Progress"
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 2"
    And the counter for "john.doe" should be red
  ...
```

### 2. Добавить step definitions (если не созданы в TASK-73)

**Given степы:**
- `Given {string} has {int} issue(s) in column {string} swimlane {string}`
- `Given {string} has issues: {table}` (для DataTables)

**Then степы:**
- `Then only {int} issues in {string} for {string} should be highlighted red`

### 3. Создать `limit-scope.feature.cy.tsx`

```typescript
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './limit-scope.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

## Критерии приёмки

- [ ] `limit-scope.feature` содержит 4 сценария
- [ ] ID только в тегах
- [ ] Описание Feature добавлено
- [ ] Step definitions работают
- [ ] Тесты проходят: `npx cypress run --component --spec "src/person-limits/BoardPage/features/limit-scope.feature.cy.tsx"`

## Зависимости

- Зависит от: TASK-72 (helpers), TASK-73 (common steps)
