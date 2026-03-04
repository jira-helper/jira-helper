# TASK-132: edge-cases.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `edge-cases.feature` для граничных сценариев.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── edge-cases.feature
└── edge-cases.feature.cy.tsx
```

## Сценарии (2)

### SC-EDGE-1: Skip cells not found on current board

```gherkin
@SC-EDGE-1
Scenario: Skip cells not found on current board
  Given there is a range "Mixed" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "Mixed" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
    | sw99     | In Progress | false     |
  And there are 3 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "3/5"
```

### SC-EDGE-2: Board shows normally when no WIP limit settings exist

```gherkin
@SC-EDGE-2
Scenario: Board shows normally when no WIP limit settings exist
  Given there are no WIP limit on cells settings configured
  When the board is displayed
  Then no WIP limit badges should be shown
  And no dashed borders should be applied
  And the board should display normally
```

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/edge-cases.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `edge-cases.feature` с 2 сценариями (SC-EDGE-1/2)
- Создан `edge-cases.feature.cy.tsx`
- Все тесты проходят (2 passing)

**Проблемы и решения**:

Проблем не возникло.
