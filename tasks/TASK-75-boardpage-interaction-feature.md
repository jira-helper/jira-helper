# TASK-75: Создать interaction.feature и step definitions для BoardPage

**Status**: TODO

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Создать feature файл для сценариев взаимодействия — клик по аватару для фильтрации задач на доске (SC-INTERACT-1 — SC-INTERACT-3).

## Файлы

```
src/person-limits/BoardPage/features/
├── interaction.feature          # новый - 3 сценария
├── interaction.feature.cy.tsx   # новый - ~16 строк
└── steps/
    └── common.steps.ts          # обновить - добавить степы
```

## Сценарии (3)

| ID | Название |
|----|----------|
| SC-INTERACT-1 | Click avatar filters board to show only matching issues |
| SC-INTERACT-2 | Click avatar again removes filter |
| SC-INTERACT-3 | Click second limit of same person |

## Что сделать

### 1. Создать `interaction.feature`

```gherkin
Feature: Personal WIP Limits on Board - Interaction

  Взаимодействие с аватарами лимитов. Клик по аватару фильтрует
  доску, показывая только задачи, которые учитываются в этом лимите.
  Повторный клик снимает фильтр.

  @SC-INTERACT-1
  Scenario: Click avatar filters board to show only matching issues
    Given a WIP limit: login "john.doe" name "John Doe" value 2 columns "In Progress" swimlanes "all" issueTypes "all"
    And issue "1" assigned to "john.doe" in column "To Do"
    And issue "2" assigned to "john.doe" in column "In Progress"
    And issue "3" assigned to "jane.doe" in column "In Progress"
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "2" should be visible
    And issue "1" should be hidden
    And issue "3" should be hidden
  ...
```

### 2. Добавить step definitions

**Given степы:**
- `Given issue {string} assigned to {string} in column {string}`
- `Given issue {string} assigned to {string} in column {string} swimlane {string}`

**When степы:**
- `When I click on {string} avatar`
- `When I click on {string} avatar again`
- `When I click on the {word} {string} avatar` (first/second)

**Then степы:**
- `Then issue {string} should be visible`
- `Then issue {string} should be hidden`
- `Then all issues should be visible`
- `Then only {string} issues should be visible`

### 3. Создать `interaction.feature.cy.tsx`

```typescript
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './interaction.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

## Особенности

Interaction тесты требуют:
1. Создание mock DOM элементов для issues
2. Симуляция фильтрации (showOnlyChosen изменяет display стили)
3. Проверка видимости через `cy.get('[data-issue-id="X"]').should('be.visible')`

## Критерии приёмки

- [ ] `interaction.feature` содержит 3 сценария
- [ ] ID только в тегах
- [ ] Описание Feature добавлено
- [ ] Step definitions создают mock issues и симулируют фильтрацию
- [ ] Тесты проходят: `npx cypress run --component --spec "src/person-limits/BoardPage/features/interaction.feature.cy.tsx"`

## Зависимости

- Зависит от: TASK-72 (helpers), TASK-73 (common steps)
