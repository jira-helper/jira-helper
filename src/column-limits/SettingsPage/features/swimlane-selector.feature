Feature: Column Limits - Swimlane Selection

  Выбор свимлейнов для каждой группы колонок.
  Позволяет ограничить подсчёт WIP только задачами из выбранных свимлейнов.
  По умолчанию учитываются все свимлейны.

  Background:
    Given the board has swimlanes:
      | name     |
      | Frontend |
      | Backend  |
      | Expedite |
    And I am on the Column WIP Limits settings page

  @SC-SWIM-UI-1
  Scenario: Default state shows "All swimlanes" selected
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    Then I see checkbox "All swimlanes" is checked
    And I do not see element "[data-testid='swimlane-list']"

  @SC-SWIM-UI-2
  Scenario: Uncheck "All swimlanes" shows individual checkboxes
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I uncheck "All swimlanes"
    Then I see element "[data-testid='swimlane-list']"
    And I see checkbox "Frontend" is checked
    And I see checkbox "Backend" is checked
    And I see checkbox "Expedite" is checked

  @SC-SWIM-UI-3
  Scenario: Select specific swimlanes
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I uncheck "All swimlanes"
    And I uncheck "Expedite"
    Then I see checkbox "Frontend" is checked
    And I see checkbox "Backend" is checked
    And I see checkbox "Expedite" is unchecked

  @SC-SWIM-UI-4
  Scenario: Selecting all swimlanes collapses back to "All swimlanes"
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I uncheck "All swimlanes"
    And I uncheck "Expedite"
    And I check "Expedite"
    Then I see checkbox "All swimlanes" is checked
    And I do not see element "[data-testid='swimlane-list']"

  @SC-SWIM-UI-5
  Scenario: Swimlane selection is saved with group
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I uncheck "All swimlanes"
    And I uncheck "Expedite"
    And I click "Save" button
    Then group "group-1" should have swimlanes "Frontend, Backend" in property
