# TASK-73: Создать display.feature и step definitions для BoardPage

**Status**: TODO

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Создать feature файл для сценариев отображения (SC-DISPLAY-1 — SC-DISPLAY-7) и соответствующие step definitions.

## Файлы

```
src/person-limits/BoardPage/features/
├── display.feature              # новый - 7 сценариев
├── display.feature.cy.tsx       # новый - ~16 строк
└── steps/
    └── common.steps.ts          # новый - step definitions
```

## Сценарии (7)

| ID | Название |
|----|----------|
| SC-DISPLAY-1 | No limits configured shows nothing |
| SC-DISPLAY-2 | Counter within limit (green) |
| SC-DISPLAY-3 | Counter at limit (yellow) |
| SC-DISPLAY-4 | Counter over limit (red) with highlighted cards |
| SC-DISPLAY-5 | Person has no issues (zero count) |
| SC-DISPLAY-6 | Multiple people with limits |
| SC-DISPLAY-7 | Same person with multiple limits (different columns) |

## Что сделать

### 1. Создать `display.feature`

```gherkin
Feature: Personal WIP Limits on Board - Display

  Отображение счётчиков WIP-лимитов для пользователей на доске.
  Цвет счётчика зависит от заполненности: зелёный (в норме),
  жёлтый (на лимите), красный (превышен).

  @SC-DISPLAY-1
  Scenario: No limits configured shows nothing
    Given there are no WIP limits configured
    When the board is displayed
    Then no WIP limit counters should be visible
  ...
```

### 2. Создать step definitions в `common.steps.ts`

**Given степы:**
- `Given there are no WIP limits configured`
- `Given a WIP limit: login {string} name {string} value {int} columns {string} swimlanes {string} issueTypes {string}`
- `Given {string} has {int} issues on the board`
- `Given {string} has {int} issues in column {string}`

**When степы:**
- `When the board is displayed` — вызов mountComponent()

**Then степы:**
- `Then no WIP limit counters should be visible`
- `Then the counter for {string} should show {string}`
- `Then the counter for {string} should be {word}` (green/yellow/red)
- `Then I should see {int} counters for {string}`
- `Then the {word} counter for {string} should show {string}` (first/second)

### 3. Создать `display.feature.cy.tsx`

```typescript
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './display.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

## Критерии приёмки

- [ ] `display.feature` содержит 7 сценариев
- [ ] ID только в тегах, не в названиях
- [ ] Описание Feature добавлено
- [ ] Step definitions созданы и работают
- [ ] `display.feature.cy.tsx` — ~16 строк
- [ ] Тесты проходят: `npx cypress run --component --spec "src/person-limits/BoardPage/features/display.feature.cy.tsx"`

## Зависимости

- Зависит от: TASK-72 (helpers)
- Референс: `src/person-limits/SettingsPage/features/`
