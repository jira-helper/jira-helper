# TASK-131: multiple-ranges.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `multiple-ranges.feature` для сценариев множественных ranges и dynamic update.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── multiple-ranges.feature
└── multiple-ranges.feature.cy.tsx
```

## Сценарии (3)

### SC-MULTI-1: Multiple ranges displayed independently

```gherkin
@SC-MULTI-1
Scenario: Multiple ranges displayed independently
  Given there is a range "Range A" with:
    | wipLimit | disable |
    | 3        | false   |
  And the range "Range A" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there is a range "Range B" with:
    | wipLimit | disable |
    | 5        | false   |
  And the range "Range B" has cells:
    | swimlane | column | showBadge |
    | Backend  | Review | true      |
  And there are 4 issues in cell "Frontend / In Progress"
  And there are 2 issues in cell "Backend / Review"
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "4/3"
  And the cell "Frontend / In Progress" should have class "WipLimit_NotRespected"
  And the cell "Backend / Review" should show a badge "2/5"
  And the cell "Backend / Review" should have class "WipLimit_Respected"
```

### SC-UPDATE-1: Board updates when issues are moved

Примечание: Этот сценарий требует динамического обновления. Реализация может потребовать дополнительного step definition для симуляции перемещения issue.

```gherkin
@SC-UPDATE-1
Scenario: Board updates when issues are moved
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 3        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there are 2 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "2/3"
  When an issue is added to cell "Frontend / In Progress"
  And the board is re-rendered
  Then the cell "Frontend / In Progress" should show a badge "3/3"
```

### SC-UPDATE-2: Board updates when issues are removed

```gherkin
@SC-UPDATE-2
Scenario: Board updates when issues are removed
  Given there is a range "My Range" with:
    | wipLimit | disable |
    | 3        | false   |
  And the range "My Range" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  And there are 4 issues in cell "Frontend / In Progress"
  When the board is displayed
  Then the cell "Frontend / In Progress" should show a badge "4/3"
  When an issue is removed from cell "Frontend / In Progress"
  And the board is re-rendered
  Then the cell "Frontend / In Progress" should show a badge "3/3"
```

## Дополнительные step definitions

Для SC-UPDATE-1 и SC-UPDATE-2 нужно добавить в common.steps.ts:

```typescript
When(/^an issue is added to cell "([^"]*)"$/, (cellName: string) => {
  // Add issue to cell
});

When(/^an issue is removed from cell "([^"]*)"$/, (cellName: string) => {
  // Remove first issue from cell
});

When('the board is re-rendered', () => {
  const ranges = getRanges();
  cy.then(() => {
    renderWipLimitCells(ranges, shouldCountIssue);
  });
});
```

## Acceptance Criteria

- [ ] Feature файл содержит 3 сценария
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Дополнительные step definitions добавлены для dynamic update
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/multiple-ranges.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `multiple-ranges.feature` с 3 сценариями (SC-MULTI-1, SC-UPDATE-1/2)
- Создан `multiple-ranges.feature.cy.tsx`
- Добавлены step definitions для dynamic update (add/remove issue, re-render)
- Все тесты проходят (3 passing)

**Проблемы и решения**:

Проблем не возникло.
