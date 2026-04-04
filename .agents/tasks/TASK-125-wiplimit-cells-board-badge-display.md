# TASK-125: badge-display.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `badge-display.feature` для сценариев отображения badge.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── badge-display.feature
└── badge-display.feature.cy.tsx
```

## Сценарии (2)

### SC-BADGE-1: Show badge with issue count and limit on cell with showBadge enabled

```gherkin
@SC-BADGE-1
Scenario: Show badge with issue count and limit on cell with showBadge enabled
  Given there is a range "Critical Path" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "Critical Path" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | false     |
  And there are 3 issues in cell "Frontend / In Progress"
  And there are 1 issues in cell "Backend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "4/5"
  And the cell "Backend / In Progress" should not show a badge
```

### SC-BADGE-2: Badge counts issues across all cells in range

```gherkin
@SC-BADGE-2
Scenario: Badge counts issues across all cells in range
  Given there is a range "Sprint Work" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "Sprint Work" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | true      |
    | Frontend | Review      | false     |
  And there are 3 issues in cell "Frontend / In Progress"
  And there are 4 issues in cell "Backend / In Progress"
  And there are 2 issues in cell "Frontend / Review"
  When the board is displayed
  Then badges should show "9/10"
```

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария с DataTable для cells
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Импортирует common.steps.ts и helpers.tsx
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/badge-display.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `badge-display.feature` с 2 сценариями (SC-BADGE-1, SC-BADGE-2)
- Создан `badge-display.feature.cy.tsx` с defineFeature API
- Все тесты проходят (2 passing)

**Проблемы и решения**:

**Проблема 1: Cleanup между сценариями**

Контекст: DOM не очищался между сценариями.

Решение: Добавлена поддержка `AfterScenario` в bdd-runner.ts.
