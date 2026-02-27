# TASK-80: Создать filters.feature для Column Limits BoardPage

**Status**: TODO

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать filters.feature с 3 сценариями фильтрации (swimlane + issueType).

## Сценарии (3)

| ID | Название |
|----|----------|
| SC-SWIM-1 | Ignore issues in excluded swimlanes |
| SC-ISSUE-1 | Count only specified issue types |
| SC-ISSUE-2 | Empty filter counts all issue types |

## Что сделать

### 1. Создать `filters.feature`

```gherkin
Feature: Column Group WIP Limits - Filters

  Фильтрация задач по свимлейнам и типам задач.
  Исключённые свимлейны не учитываются в лимитах.
  Можно считать только определённые типы задач.

  @SC-SWIM-1
  Scenario: Ignore issues in excluded swimlanes
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 2     |       |            |
    Given swimlane "Excluded" is set to ignore WIP limits
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Excluded | Task      |
      | In Progress | Excluded | Task      |
    When the board is displayed
    Then the badge on "In Progress" should show "3/2"
    And the limit should be exceeded
  ...
```

### 2. Добавить step definitions

**Given:**
- `Given swimlane {string} is set to ignore WIP limits`

**Then:**
- `Then the limit should be exceeded`
- `Then the limit should not be exceeded`

## Критерии приёмки

- [ ] `filters.feature` содержит 3 сценария
- [ ] Swimlane filtering работает
- [ ] IssueType filtering работает
- [ ] Тесты проходят

## Зависимости

- Зависит от: TASK-77, TASK-78
