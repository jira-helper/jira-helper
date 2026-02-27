# TASK-78: Создать display.feature для Column Limits BoardPage

**Status**: DONE

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать display.feature с 3 сценариями отображения и соответствующие step definitions. (SC-DISPLAY-4 rounded corners проверяется в Storybook.)

## Файлы

```
src/column-limits/BoardPage/features/
├── display.feature              # новый - 3 сценария
├── display.feature.cy.tsx       # новый
└── steps/
    └── common.steps.ts          # обновить - добавить steps
```

## Сценарии (3)

| ID | Название |
|----|----------|
| SC-DISPLAY-1 | Show badge X/Y on first column of group |
| SC-DISPLAY-2 | Badge updates when issue count changes |
| SC-DISPLAY-3 | Group columns have shared header color |

## Что сделать

### 1. Создать `display.feature`

```gherkin
Feature: Column Group WIP Limits - Display

  Отображение бейджей X/Y на заголовках колонок группы.
  Бейдж показывается на первой колонке группы.

  @SC-DISPLAY-1
  Scenario: Show badge X/Y on first column of group
    Given there are column groups:
      | name        | columns             | limit | color | issueTypes |
      | Development | In Progress, Review | 5     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
      | Review      | Frontend | Task      |
    When the board is displayed
    Then the badge on "In Progress" should show "4/5"
  ...
```

### 2. Добавить step definitions

**Given:**
- `Given there are column groups:` — DataTable с группами
- `Given the board has issues:` — DataTable с issues

**When:**
- `When the board is displayed` — вызов `applyLimits()`

**Then:**
- `Then the badge on {string} should show {string}`
- `Then {string} and {string} headers should have border color {string}`

### 3. Создать `display.feature.cy.tsx`

```typescript
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './display.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

## Критерии приёмки

- [x] `display.feature` содержит 3 сценария
- [x] DataTable для групп и issues работает
- [x] Step definitions созданы
- [x] Тесты проходят: `npx cypress run --component --spec "src/column-limits/BoardPage/features/display.feature.cy.tsx"`

## Зависимости

- Зависит от: TASK-77 (helpers)
- Референс: `src/column-limits/BoardPage/board-page.feature.cy.tsx` (SC-DISPLAY-1..4)

---

## Результаты

**Дата**: 2025-02-27

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Созданы файлы:
- `src/column-limits/BoardPage/features/display.feature` — 3 сценария (SC-DISPLAY-1..3) с DataTable для групп и issues. SC-DISPLAY-4 (rounded corners) проверяется в Storybook.
- `src/column-limits/BoardPage/features/display.feature.cy.tsx` — BDD runner интеграция

Обновлён:
- `src/column-limits/BoardPage/features/steps/common.steps.ts` — добавлен step `When a new issue appears in {string}` для SC-DISPLAY-2

Все 3 теста проходят.
