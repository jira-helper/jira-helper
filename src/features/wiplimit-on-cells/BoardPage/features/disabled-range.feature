Feature: WIP Limit on Cells - Disabled Range
  As a team member
  I want to see disabled ranges with visual distinction
  So that I can identify ranges where WIP limit tracking is turned off

  Background:
    Given the board is loaded
    And there are columns:
      | id   | name        |
      | col1 | To Do       |
      | col2 | In Progress |
      | col3 | Review      |
      | col4 | Done        |
    And there are swimlanes:
      | id  | name     |
      | sw1 | Frontend |
      | sw2 | Backend  |
      | sw3 | QA       |

  @SC-DISABLE-1
  Scenario: Disabled range shows diagonal stripe pattern (class WipLimitCells_disable)
    Given there is a range "Blocked" with:
      | wipLimit | disable |
      | 5        | true    |
    And the range "Blocked" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    When the board is displayed
    Then the cell "Frontend / In Progress" should have class "WipLimitCells_disable"

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
