Feature: WIP Limit on Cells - Show Badge and Empty State

  Индикатор badge и пустое состояние таблицы.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-BADGE-1
  Scenario: Add cell with show badge indicator
    When I open the settings popup
    And I type "My Range" into "Add range" input
    And I select "Frontend" from "swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I check "show indicator" checkbox
    And I click "Add range" button
    Then the cell "Frontend / In Progress" should show the badge icon

  @SC-BADGE-2
  Scenario: Add cell without show badge indicator
    When I open the settings popup
    And I type "My Range" into "Add range" input
    And I select "Frontend" from "swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    Then the cell "Frontend / In Progress" should not show the badge icon

  @SC-EMPTY-1
  Scenario: Show empty table when no ranges configured
    When I open the settings popup
    Then I see the ranges table with headers
    And the ranges table should be empty
    And I see input "Add range"
    And I see dropdown "swimlane"
    And I see dropdown "Column"
