# TASK-129: disabled-range.feature для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `disabled-range.feature` для сценариев отключённых диапазонов.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── disabled-range.feature
└── disabled-range.feature.cy.tsx
```

## Сценарии (2)

### SC-DISABLE-1: Disabled range shows diagonal stripe pattern

```gherkin
@SC-DISABLE-1
Scenario: Disabled range shows diagonal stripe pattern
  Given there is a range "Blocked" with:
    | wipLimit | disable |
    | 5        | true    |
  And the range "Blocked" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have class "WipLimitCells_disable"
```

### SC-DISABLE-2: Disabled range still shows borders but no limit indicators

```gherkin
@SC-DISABLE-2
Scenario: Disabled range still shows borders but no limit indicators
  Given there is a range "Blocked" with:
    | wipLimit | disable |
    | 5        | true    |
  And the range "Blocked" has cells:
    | swimlane | column      | showBadge |
    | Frontend | In Progress | true      |
  When the board is displayed
  Then the cell "Frontend / In Progress" should have dashed border on top
  And the cell "Frontend / In Progress" should have class "WipLimitCells_disable"
  And the cell "Frontend / In Progress" should not show a badge
```

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария
- [ ] cy.tsx файл использует `defineFeature` из bdd-runner
- [ ] Все сценарии проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/features/disabled-range.feature.cy.tsx"`

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `disabled-range.feature` с 2 сценариями (SC-DISABLE-1/2)
- Создан `disabled-range.feature.cy.tsx`
- Исправлен баг в renderWipLimitCells.ts
- Все тесты проходят (2 passing)

**Проблемы и решения**:

**Проблема 1: Badge показывался для disabled range**

Контекст: SC-DISABLE-2 падал — badge отображался даже при disable=true.

Решение: Добавлена проверка `!range.disable` перед вставкой badge в `renderWipLimitCells.ts`.
