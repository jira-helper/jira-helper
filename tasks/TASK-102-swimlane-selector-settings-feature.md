# TASK-102: Feature файл для SwimlaneSelector UI

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Создать BDD feature файл с Gherkin сценариями для UI выбора свимлейнов в настройках Column Limits.

## Что сделать

### 1. Создать `swimlane-selector.feature`

**Файл**: `src/column-limits/SettingsPage/features/swimlane-selector.feature`

```gherkin
Feature: Swimlane selection in column groups
  As a user
  I want to select swimlanes for each column group
  So that WIP limits only count issues from selected swimlanes

  Background:
    Given the board has swimlanes:
      | name     |
      | Frontend |
      | Backend  |
      | Expedite |
    And I am on the Column Limits settings modal

  @SC-SWIM-UI-1
  Scenario: Default state shows "All swimlanes" selected
    When I create a new group with columns "In Progress"
    Then the group should show "All swimlanes" checkbox checked
    And the swimlane list should be hidden

  @SC-SWIM-UI-2
  Scenario: Uncheck "All swimlanes" shows individual checkboxes
    Given I have a group with columns "In Progress"
    When I uncheck "All swimlanes" checkbox
    Then I should see checkboxes for each swimlane
    And all individual swimlane checkboxes should be checked

  @SC-SWIM-UI-3
  Scenario: Select specific swimlanes
    Given I have a group with columns "In Progress"
    And I uncheck "All swimlanes" checkbox
    When I uncheck "Expedite" swimlane
    Then "Frontend" and "Backend" should remain checked
    And "Expedite" should be unchecked

  @SC-SWIM-UI-4
  Scenario: Selecting all swimlanes collapses back to "All swimlanes"
    Given I have a group with columns "In Progress"
    And I have unchecked "All swimlanes"
    And I have unchecked "Expedite"
    When I check "Expedite" swimlane
    Then "All swimlanes" checkbox should become checked
    And the swimlane list should be hidden

  @SC-SWIM-UI-5
  Scenario: Swimlane selection is saved with group
    Given I have a group with columns "In Progress"
    And I have selected only "Frontend" and "Backend" swimlanes
    When I click "Save"
    And I reopen the settings modal
    Then the group should show "Frontend" and "Backend" selected
    And "Expedite" should be unchecked
```

## Критерии приёмки

- [ ] Feature файл создан
- [ ] 5 сценариев описаны в Gherkin
- [ ] Сценарии покрывают: default state, expand/collapse, selection, persistence

## Зависимости

- Нет зависимостей (это первая задача Phase 1)
