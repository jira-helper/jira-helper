# TASK-103: Feature файл для BoardPage swimlane filtering

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Создать BDD feature файл с Gherkin сценариями для логики фильтрации по свимлейнам на BoardPage.

## Что сделать

### 1. Создать `swimlane-filter.feature`

**Файл**: `src/column-limits/BoardPage/features/swimlane-filter.feature`

```gherkin
Feature: Swimlane filtering for column groups
  As a user
  I want column limits to count only issues from selected swimlanes
  So that I can have different WIP limits for different team swimlanes

  Background:
    Given the board has columns:
      | name        |
      | In Progress |
      | Review      |
    And the board has swimlanes:
      | name     |
      | Frontend |
      | Backend  |
      | Expedite |

  @SC-SWIM-BOARD-1
  Scenario: Count issues only from selected swimlanes
    Given there are column groups:
      | name | columns     | limit | swimlanes         |
      | Dev  | In Progress | 2     | Frontend, Backend |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Backend  |
      | In Progress | Expedite |
    When the board is displayed
    Then the badge on "Dev" should show "2/2"
    And the limit should be exceeded

  @SC-SWIM-BOARD-2
  Scenario: All swimlanes when empty selection
    Given there are column groups:
      | name | columns     | limit | swimlanes |
      | Dev  | In Progress | 3     |           |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Backend  |
      | In Progress | Expedite |
    When the board is displayed
    Then the badge on "Dev" should show "3/3"

  @SC-SWIM-BOARD-3
  Scenario: Different swimlanes for different groups
    Given there are column groups:
      | name     | columns     | limit | swimlanes |
      | Frontend | In Progress | 2     | Frontend  |
      | Backend  | In Progress | 1     | Backend   |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Frontend |
      | In Progress | Backend  |
    When the board is displayed
    Then the badge on "Frontend" should show "2/2"
    And the badge on "Backend" should show "1/1"
```

## Критерии приёмки

- [ ] Feature файл создан
- [ ] 3 сценария описаны в Gherkin
- [ ] Сценарии покрывают: per-group filtering, empty = all, different groups

## Зависимости

- Нет зависимостей (это первая задача Phase 1)
