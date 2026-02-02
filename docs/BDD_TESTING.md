# BDD Testing Guide

This document describes the Behavior-Driven Development (BDD) testing approach used in this project.

## Overview

We use a multi-layer testing strategy that combines:

- **Gherkin Feature Files** - Business-readable specifications
- **vitest-cucumber** - BDD unit tests for stores and logic
- **Cypress** - Component tests in real browser

## Architecture

```
src/<feature>/
├── <module>.feature              # Gherkin specification (source of truth)
├── <Module>.cy.tsx               # Cypress component tests
├── stores/
│   └── <store>.bdd.test.ts       # vitest-cucumber unit tests
└── components/
    └── <Component>.test.tsx      # Standard unit tests (vitest + RTL)
```

### Example Structure

```
src/person-limits/
├── SettingsPage/
│   ├── settings-page.feature           # Feature specification
│   ├── SettingsPage.cy.tsx             # Cypress component tests
│   ├── stores/
│   │   └── settingsUIStore.bdd.test.ts # BDD store tests
│   └── components/
│       └── *.test.tsx                  # Unit tests
└── BoardPage/
    ├── board-page.feature
    └── board-page.bdd.test.ts
```

## Feature Files

Feature files are written in **product language** (not technical). They serve as the single source of truth for feature behavior.

### Format

```gherkin
Feature: <Feature Name>
  As a <role>
  I want to <goal>
  So that <benefit>

  Background:
    Given <common precondition>
    And <another precondition>

  @SC1
  Scenario: SC1: <Scenario description>
    Given <precondition>
    When <action>
    Then <expected result>
```

### Conventions

1. **Scenario IDs**: Each scenario has a unique ID (SC1, SC2, etc.)
2. **Tags**: Use `@SC1` tag before each scenario for filtering
3. **Product language**: Write from user perspective, avoid technical terms
4. **Background**: Common setup shared across scenarios

### Example

```gherkin
Feature: Personal WIP Limit Settings
  As a team lead
  I want to manage personal WIP limits for team members
  So that I can control workload distribution

  Background:
    Given I am on the Personal WIP Limits settings page
    And there are columns "To Do, In Progress, Done" on the board

  @SC1
  Scenario: SC1: Add a new limit for a person
    When I enter person name "john.doe"
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "john.doe" in the limits list
    And the limit should show value 5
```

## vitest-cucumber Tests

Used for testing **store actions and business logic** in isolation.

### Setup

```typescript
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { useSettingsUIStore } from './settingsUIStore';

const feature = await loadFeature('src/path/to/feature.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  Background(({ Given, And }) => {
    Given('I am on the settings page', () => {
      useSettingsUIStore.getState().actions.reset();
    });
  });

  Scenario('SC1: Add a new limit', ({ When, And, Then }) => {
    When('I enter person name "john.doe"', () => {
      // Implementation
    });

    Then('I should see "john.doe" in the list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits.some(l => l.person.name === 'john.doe')).toBe(true);
    });
  });
});
```

### Running

```bash
# Run all BDD tests
npm test -- --run "**/*.bdd.test.ts"

# Run specific feature
npm test -- --run src/person-limits/SettingsPage/stores/settingsUIStore.bdd.test.ts
```

## Cypress Component Tests

Used for testing **React components in a real browser** with BDD-style structure.

### Setup

```typescript
import React from 'react';
import { MyComponent } from './MyComponent';
import { useStore } from './store';

describe('Feature: My Feature', () => {
  beforeEach(() => {
    useStore.getState().actions.reset();
  });

  describe('SC1: Scenario description', () => {
    it('SC1: When action, Then result', () => {
      cy.mount(<MyComponent />);
      
      // When
      cy.get('#input').type('value');
      cy.contains('button', 'Submit').click();
      
      // Then
      cy.contains('Success').should('be.visible');
    });
  });
});
```

### Conventions

1. **describe** matches Scenario name with ID: `describe('SC1: Add a new limit')`
2. **it** includes scenario ID: `it('SC1: When I add limit, Then I see it')`
3. **Comments** mark Given/When/Then sections in test body
4. **beforeEach** handles Background steps

### Running

```bash
# Run headless
npm run cy:run

# Open Cypress UI
npm run cy:open
```

## Test Layers Comparison

| Layer | Technology | Speed | Scope | When to Use |
|-------|------------|-------|-------|-------------|
| Feature Files | Gherkin | - | Specification | Always - source of truth |
| Store BDD | vitest-cucumber | ~6ms/46 tests | Logic | State management, business rules |
| Component | Cypress | ~2s/6 tests | UI | User interactions, visual behavior |
| Unit | Vitest + RTL | Fast | Functions | Pure functions, utilities |

## Best Practices

### Writing Feature Files

✅ **Do:**
- Write from user perspective
- Use business domain language
- Include scenario IDs (SC1, SC2, etc.)
- Keep scenarios independent

❌ **Don't:**
- Reference technical implementation (store, API, etc.)
- Use vague assertions ("it should work")
- Create dependencies between scenarios

### Writing Tests

✅ **Do:**
- Match test structure 1:1 with feature scenarios
- Include scenario ID in describe/it blocks
- Add comments for Given/When/Then sections
- Reset state in beforeEach

❌ **Don't:**
- Skip scenario IDs
- Combine multiple scenarios in one test
- Test implementation details in BDD tests

## Why This Approach?

### Why vitest-cucumber for stores?
- Fast execution (~6ms for 46 tests)
- Direct Gherkin file integration
- No DOM overhead for logic tests

### Why Cypress for components?
- Real browser environment
- Visual debugging
- Reliable async handling
- Works with complex React components

### Why not vitest-cucumber for React?
- React Testing Library cleanup between steps breaks BDD flow
- Each step becomes isolated, losing component state
- Cypress handles component lifecycle properly

### Why not Cypress cucumber preprocessor?
- Conflicts with Vite bundler in component testing mode
- Works for E2E but not for component tests with Vite

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all Vitest tests (unit + BDD) |
| `npm test -- --run "**/*.bdd.test.ts"` | Run only BDD tests |
| `npm run cy:run` | Run Cypress component tests (headless) |
| `npm run cy:open` | Open Cypress UI |

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `<module>.feature` | `settings-page.feature` |
| Cypress | `<Module>.cy.tsx` | `SettingsPage.cy.tsx` |
| BDD Unit | `<store>.bdd.test.ts` | `settingsUIStore.bdd.test.ts` |
| Unit Test | `<Component>.test.tsx` | `PersonalWipLimitContainer.test.tsx` |
