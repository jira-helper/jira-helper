# TASK-115: Helpers и common.steps для SettingsPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring

---

## Цель

Создать инфраструктуру для BDD тестов SettingsPage: `helpers.tsx` и `steps/common.steps.ts`.

## Создаваемые файлы

```
src/wiplimit-on-cells/SettingsPage/features/
├── helpers.tsx
└── steps/
    └── common.steps.ts
```

---

## helpers.tsx

```tsx
import React from 'react';
import { SettingsButtonContainer } from '../components/SettingsButton';
import { useWipLimitCellsSettingsUIStore } from '../stores/settingsUIStore';
import type { WipLimitRange } from '../../types';

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
  { id: 'sw3', name: 'QA' },
];

export const createRange = (
  name: string,
  wipLimit: number = 0,
  cells: Array<{ swimlane: string; column: string; showBadge: boolean }> = [],
  disable: boolean = false
): WipLimitRange => ({
  name,
  wipLimit,
  cells,
  disable,
});

let onSaveToProperty: Cypress.Agent<sinon.SinonStub>;

export const setupBackground = () => {
  useWipLimitCellsSettingsUIStore.setState(
    useWipLimitCellsSettingsUIStore.getInitialState()
  );
  const saveStub = cy.stub().resolves();
  (saveStub as sinon.SinonStub & { as: (alias: string) => void }).as('onSaveToProperty');
  onSaveToProperty = saveStub as Cypress.Agent<sinon.SinonStub>;
};

export const mountComponent = (initialRanges: WipLimitRange[] = []) => {
  cy.mount(
    <SettingsButtonContainer
      swimlanes={swimlanes}
      columns={columns}
      initialRanges={initialRanges}
      onSaveToProperty={onSaveToProperty}
    />
  );
};

export const getOnSaveToProperty = () => onSaveToProperty;
```

---

## steps/common.steps.ts

```typescript
import { Given, When, Then } from '../../../../cypress/support/bdd-runner';
import { mountComponent, createRange, swimlanes, columns, getOnSaveToProperty } from '../helpers';
import { useWipLimitCellsSettingsUIStore } from '../../stores/settingsUIStore';

// === Background ===

Given('I am on the WIP Limit on Cells settings page', () => {
  // Setup done in Background
});

Given('there are columns {string} on the board', (_columns: string) => {
  // Columns are pre-configured in helpers
});

Given('there are swimlanes {string} on the board', (_swimlanes: string) => {
  // Swimlanes are pre-configured in helpers
});

// === Open/Close Modal ===

When('I click {string}', (buttonText: string) => {
  cy.contains('button', buttonText).click();
});

When('I open the settings popup', () => {
  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains('Edit WipLimit on cells').should('exist');
});

Then('I should see the {string} popup', (title: string) => {
  cy.contains(title).should('exist');
});

Then('the popup should close', () => {
  cy.contains('button', 'Edit Wip limits by cells', { timeout: 3000 }).should('be.visible');
});

// === Range Table ===

Then('I should see the ranges table', () => {
  cy.get('#WipLimitCells_table').should('exist');
});

Then('I should see {string} in the ranges table', (rangeName: string) => {
  cy.get(`input[aria-label*="${rangeName}"]`, { timeout: 5000 }).should('exist');
});

// === Form Inputs ===

When('I enter range name {string}', (name: string) => {
  cy.get('#WIP_inputRange').type(name);
});

When('I select swimlane {string}', (swimlane: string) => {
  cy.selectAntdOption('#WIPLC_swimlane', swimlane);
});

When('I select column {string}', (column: string) => {
  cy.selectAntdOption('#WIPLC_Column', column);
});

When('I check {string}', (label: string) => {
  if (label === 'show indicator') {
    cy.get('#WIPLC_showBadge').check();
  }
});

// === Save/Cancel ===

Then('the changes should be saved to Jira board property', () => {
  cy.get('@onSaveToProperty').should('have.been.called');
});

Then('the changes should not be saved', () => {
  cy.get('@onSaveToProperty').should('not.have.been.called');
});

// === Pre-configured Ranges ===

Given('there is a range {string} in the settings', (rangeName: string) => {
  const range = createRange(rangeName);
  mountComponent([range]);
});

Given('there is a range {string} with WIP limit {int}', (rangeName: string, limit: number) => {
  const range = createRange(rangeName, limit);
  mountComponent([range]);
});

// ... more steps will be extracted from existing tests
```

---

## Acceptance Criteria

- [ ] `helpers.tsx` создан с setupBackground и mountComponent
- [ ] `steps/common.steps.ts` содержит базовые step definitions
- [ ] Все импорты корректны
- [ ] Типизация без ошибок
