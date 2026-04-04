# TASK-116: modal-lifecycle.feature для SettingsPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring  
**Depends on**: TASK-115

---

## Цель

Создать `modal-lifecycle.feature` и `modal-lifecycle.feature.cy.tsx` для тестов открытия/закрытия модалки.

## Создаваемые файлы

```
src/wiplimit-on-cells/SettingsPage/features/
├── modal-lifecycle.feature
└── modal-lifecycle.feature.cy.tsx
```

---

## modal-lifecycle.feature

```gherkin
Feature: WIP Limit on Cells Settings Modal Lifecycle

  Жизненный цикл модального окна настроек WIP лимитов по ячейкам.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-MODAL-1
  Scenario: Open settings popup
    When I click "Edit Wip limits by cells"
    Then I should see the "Edit WipLimit on cells" popup
    And I should see the "Add range" form
    And I should see the swimlane dropdown
    And I should see the column dropdown
    And I should see the "show indicator" checkbox
    And I should see the ranges table

  @SC-MODAL-2
  Scenario: Save and close popup
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click "Save"
    Then the popup should close
    And the changes should be saved to Jira board property

  @SC-MODAL-3
  Scenario: Cancel closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click "Cancel"
    Then the popup should close
    And the changes should not be saved

  @SC-MODAL-4
  Scenario: Close button (X) closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click the close button (X)
    Then the popup should close
    And the changes should not be saved
```

---

## modal-lifecycle.feature.cy.tsx

```tsx
/// <reference types="cypress" />
/**
 * Cypress Component Tests: Modal Lifecycle
 *
 * All scenarios from the .feature file run automatically.
 * Step definitions are imported from steps/common.steps.ts
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './modal-lifecycle.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

---

## Дополнительные step definitions

Добавить в `steps/common.steps.ts`:

```typescript
// === Modal Lifecycle ===

Given('I have opened the {string} popup', (title: string) => {
  mountComponent();
  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains(title).should('exist');
});

Given('I have made some changes', () => {
  cy.get('#WIP_inputRange').type('Test Range');
  cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
  cy.selectAntdOption('#WIPLC_Column', 'In Progress');
  cy.get('#WIP_buttonRange').click();
});

When('I click the close button \\(X\\)', () => {
  cy.get('.ant-modal-close').click();
});

Then('I should see the {string} form', (formName: string) => {
  if (formName === 'Add range') {
    cy.get('#WIP_inputRange').should('exist');
  }
});

Then('I should see the swimlane dropdown', () => {
  cy.get('#WIPLC_swimlane').should('exist');
});

Then('I should see the column dropdown', () => {
  cy.get('#WIPLC_Column').should('exist');
});

Then('I should see the {string} checkbox', (label: string) => {
  if (label === 'show indicator') {
    cy.get('#WIPLC_showBadge').should('exist');
  }
});
```

---

## Acceptance Criteria

- [x] Feature файл соответствует оригинальным сценариям SC-MODAL-1..4
- [x] cy.tsx файл использует `defineFeature`
- [x] Все 4 сценария проходят
- [x] Step definitions переиспользуются

---

## Результаты

**Дата**: 2025-03-02

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Созданы `modal-lifecycle.feature` и `modal-lifecycle.feature.cy.tsx`. Добавлены недостающие step definitions в `steps/common.steps.ts` (I should see the "Add range" form, swimlane dropdown, column dropdown, "show indicator" checkbox). Все 4 сценария проходят.
