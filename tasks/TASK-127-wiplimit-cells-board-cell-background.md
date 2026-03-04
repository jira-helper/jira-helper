# TASK-127: cell-background.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `cell-background.feature` для сценариев фона ячейки.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── cell-background.feature
└── cell-background.feature.cy.tsx
```

## Сценарии (2)

### SC-BG-1: Red background on cells exceeding limit

```gherkin
@SC-BG-1
Scenario: Red background on cells exceeding limit
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 3        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | false     |
  And there are 5 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should have class "WipLimit_NotRespected"
  And the cell "Backend / In Progress" should have class "WipLimit_NotRespected"
```

### SC-BG-2: No background change when within limit

```gherkin
@SC-BG-2
Scenario: No background change when within limit
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | false     |
  And there are 5 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should have class "WipLimit_Respected"
  And the cell "Frontend / In Progress" should not have class "WipLimit_NotRespected"
```

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/cell-background.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `cell-background.feature` с 2 сценариями (SC-BG-1/2)
- Создан `cell-background.feature.cy.tsx`
- Все тесты проходят (2 passing)

**Проблемы и решения**:

Проблем не возникло.
