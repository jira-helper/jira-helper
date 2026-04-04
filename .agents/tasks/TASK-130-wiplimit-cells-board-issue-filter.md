# TASK-130: issue-type-filter.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `issue-type-filter.feature` для сценариев фильтрации по типу issue.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── issue-type-filter.feature
└── issue-type-filter.feature.cy.tsx
```

## Сценарии (2)

### SC-FILTER-1: Count only specified issue types

```gherkin
@SC-FILTER-1
Scenario: Count only specified issue types
  Given there is a range "Bugs Only" with:
    | wipLimit | disable | includedIssueTypes |
    | 3        | false   | Bug, Task          |
  And the range "Bugs Only" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And cell "Frontend / In Progress" contains issues:
    | type  |
    | Bug   |
    | Task  |
    | Story |
    | Bug   |
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "3/3"
```

### SC-FILTER-2: Count all issues when no type filter is set

```gherkin
@SC-FILTER-2
Scenario: Count all issues when no type filter is set
  Given there is a range "All Types" with:
    | wipLimit | disable |
    | 10       | false   |
  And the range "All Types" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And cell "Frontend / In Progress" contains issues:
    | type  |
    | Bug   |
    | Task  |
    | Story |
    | Bug   |
    | Task  |
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "5/10"
```

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария с DataTable для issues
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/issue-type-filter.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `issue-type-filter.feature` с 2 сценариями (SC-FILTER-1/2)
- Создан `issue-type-filter.feature.cy.tsx`
- Все тесты проходят (2 passing)

**Проблемы и решения**:

Проблем не возникло.
