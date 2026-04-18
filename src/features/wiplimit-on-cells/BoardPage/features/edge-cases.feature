Feature: WIP Limit on Cells - Edge Cases
  As a team member
  I want the board to handle edge cases gracefully
  So that WIP limits work correctly with missing cells and empty settings

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

  @SC-EDGE-1
  Scenario: Skip cells not found on current board
    Given there is a range "Mixed" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Mixed" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | sw99     | In Progress | false     |
    And there are 3 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "3/5"

  @SC-EDGE-2
  Scenario: Board shows normally when no WIP limit settings exist
    Given there are no WIP limit on cells settings configured
    When the board is displayed
    Then no WIP limit badges should be shown
    And no dashed borders should be applied
    And the board should display normally
