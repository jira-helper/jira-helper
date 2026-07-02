Feature: Swimlane Selector - All swimlanes behavior

  Сценарии выбора свимлайнов в настройках лимитов.
  Покрывает однозначное переключение между режимом "All swimlanes"
  и ручным выбором отдельных свимлайнов.

  Background:
    Given there are swimlanes "Frontend, Backend, Expedite" on the board

  @SC-SWIMLANES-ALL-1
  Scenario: Show only All swimlanes checkbox in all mode
    Given the selected swimlanes are "all"
    When I open the swimlane selector
    Then checkbox "All swimlanes" should be checked
    And I should not see the individual swimlanes list

  @SC-SWIMLANES-MANUAL-1
  Scenario: Switch from all mode to manual selection
    Given the selected swimlanes are "all"
    When I open the swimlane selector
    And I uncheck "All swimlanes"
    Then checkbox "All swimlanes" should not be checked
    And I should see the individual swimlanes list
    And I should see swimlane options "Frontend, Backend, Expedite"

  @SC-SWIMLANES-MANUAL-2
  Scenario: Return from manual selection to all mode
    Given the selected swimlanes are "Frontend, Backend"
    When I open the swimlane selector
    And I check "All swimlanes"
    Then checkbox "All swimlanes" should be checked
    And I should not see the individual swimlanes list
    And the emitted selected swimlanes should be "all"

  @SC-SWIMLANES-MANUAL-3
  Scenario: Normalize full manual selection to all mode
    Given the selected swimlanes are "Frontend, Backend"
    When I open the swimlane selector
    And I select swimlane "Expedite"
    Then checkbox "All swimlanes" should be checked
    And I should not see the individual swimlanes list
    And the emitted selected swimlanes should be "all"
