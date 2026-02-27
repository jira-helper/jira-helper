# TASK-79: Создать exceed.feature для Column Limits BoardPage

**Status**: TODO

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать exceed.feature с 3 сценариями превышения лимитов.

## Сценарии (3)

| ID | Название |
|----|----------|
| SC-EXCEED-1 | Red background when group limit exceeded |
| SC-EXCEED-2 | Normal background when within limit |
| SC-EXCEED-3 | Exactly at limit shows normal background |

## Что сделать

### 1. Создать `exceed.feature`

```gherkin
Feature: Column Group WIP Limits - Limit Exceeded

  Визуальная индикация при превышении лимита группы.
  Ячейки колонок группы становятся красными при превышении.

  @SC-EXCEED-1
  Scenario: Red background when group limit exceeded
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
      | In Progress | Backend  | Task      |
      | In Progress | Frontend | Task      |
    When the board is displayed
    Then "In Progress" column cells should have red background
  ...
```

### 2. Добавить step definitions

**Then:**
- `Then {string} column cells should have red background`
- `Then {string} column cells should have normal background`
- `Then the badge should show {string}`

## Критерии приёмки

- [ ] `exceed.feature` содержит 3 сценария
- [ ] Step definitions для проверки background созданы
- [ ] Тесты проходят

## Зависимости

- Зависит от: TASK-77 (helpers), TASK-78 (общие steps)
