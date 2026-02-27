# TASK-80: Создать issue-type-filter.feature для Column Limits BoardPage

**Status**: TODO

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

> **Note**: Swimlane filtering (SC-SWIM-1) вынесен в [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md).
> Эта задача создаёт только **issueType** фильтрацию.

## Описание

Создать issue-type-filter.feature с 2 сценариями фильтрации по типам задач.

## Сценарии (2)

| ID | Название |
|----|----------|
| SC-ISSUE-1 | Count only specified issue types |
| SC-ISSUE-2 | Empty filter counts all issue types |

## Что сделать

### 1. Создать `issue-type-filter.feature`

```gherkin
Feature: Column Group WIP Limits - Issue Type Filter

  Фильтрация задач по типам задач.
  Можно считать только определённые типы задач.
  Пустой фильтр = все типы.

  Background:
    Given the board has columns:
      | name        |
      | In Progress |
      | Review      |

  @SC-ISSUE-1
  Scenario: Count only specified issue types
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 2     |       | Bug        |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Bug       |
      | In Progress | Frontend | Bug       |
    When the board is displayed
    Then the badge on "In Progress" should show "2/2"
    And the limit should be exceeded

  @SC-ISSUE-2
  Scenario: Empty filter counts all issue types
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Bug       |
      | In Progress | Frontend | Story     |
    When the board is displayed
    Then the badge on "In Progress" should show "3/3"
    And the limit should be exceeded
```

### 2. Step definitions

Все необходимые steps уже есть в `common.steps.ts`:
- `Given there are column groups:` — уже есть
- `Given the board has issues:` — уже есть
- `When the board is displayed` — уже есть
- `Then the badge on {string} should show {string}` — уже есть
- `Then the limit should be exceeded` — уже есть

## Критерии приёмки

- [ ] `issue-type-filter.feature` содержит 2 сценария
- [ ] IssueType filtering работает (issueTypes в DataTable)
- [ ] Тесты проходят

## Зависимости

- Зависит от: TASK-77, TASK-78
