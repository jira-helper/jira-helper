# TASK-128: dashed-borders.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `dashed-borders.feature` для сценариев пунктирных границ.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── dashed-borders.feature
└── dashed-borders.feature.cy.tsx
```

## Сценарии (4)

### SC-BORDER-1: Single cell gets all four borders

```gherkin
@SC-BORDER-1
Scenario: Single cell gets all four borders
  Given there is a range "Solo" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "Solo" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have dashed border on top
  And the cell "Frontend / In Progress" should have dashed border on bottom
  And the cell "Frontend / In Progress" should have dashed border on left
  And the cell "Frontend / In Progress" should have dashed border on right
```

### SC-BORDER-2: Adjacent cells in same row share inner borders

```gherkin
@SC-BORDER-2
Scenario: Adjacent cells in same row share inner borders
  Given there is a range "Row Range" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "Row Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Frontend | Review      | false     |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have dashed border on top
  And the cell "Frontend / In Progress" should have dashed border on bottom
  And the cell "Frontend / In Progress" should have dashed border on left
  And the cell "Frontend / In Progress" should not have dashed border on right
  And the cell "Frontend / Review" should have dashed border on top
  And the cell "Frontend / Review" should have dashed border on bottom
  And the cell "Frontend / Review" should have dashed border on right
  And the cell "Frontend / Review" should not have dashed border on left
```

### SC-BORDER-3: Adjacent cells in same column share inner borders

```gherkin
@SC-BORDER-3
Scenario: Adjacent cells in same column share inner borders
  Given there is a range "Column Range" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "Column Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | false     |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have dashed border on left
  And the cell "Frontend / In Progress" should have dashed border on right
  And the cell "Frontend / In Progress" should have dashed border on top
  And the cell "Frontend / In Progress" should not have dashed border on bottom
  And the cell "Backend / In Progress" should have dashed border on left
  And the cell "Backend / In Progress" should have dashed border on right
  And the cell "Backend / In Progress" should have dashed border on bottom
  And the cell "Backend / In Progress" should not have dashed border on top
```

### SC-BORDER-4: L-shaped range has correct borders

```gherkin
@SC-BORDER-4
Scenario: L-shaped range has correct borders
  Given there is a range "L-Shape" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "L-Shape" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | Backend  | In Progress | false     |
    | Backend  | Review      | false     |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have dashed border on top
  And the cell "Frontend / In Progress" should have dashed border on left
  And the cell "Frontend / In Progress" should have dashed border on right
  And the cell "Backend / Review" should have dashed border on bottom
  And the cell "Backend / Review" should have dashed border on right
```

## Acceptance Criteria

- [ ] Feature файл содержит 4 сценария с DataTable для cells
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/dashed-borders.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `dashed-borders.feature` с 4 сценариями (SC-BORDER-1/2/3/4)
- Создан `dashed-borders.feature.cy.tsx`
- Все тесты проходят (4 passing)

**Проблемы и решения**:

Проблем не возникло.
