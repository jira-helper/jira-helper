Feature: WIP Limit on Cells - Badge Display
  As a team member
  I want to see WIP limit badges on board cells
  So that I can monitor work in progress

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

  @SC-BADGE-1
  Scenario: Show badge with issue count and limit on cell with showBadge enabled
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | false     |
    And there are 3 issues in cell "Frontend / In Progress"
    And there are 1 issues in cell "Backend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "4/5"
    And the cell "Backend / In Progress" should not show a badge

  @SC-BADGE-2
  Scenario: Badge counts issues across all cells in range
    Given there is a range "Sprint Work" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "Sprint Work" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | true      |
      | Frontend | Review      | false     |
    And there are 3 issues in cell "Frontend / In Progress"
    And there are 4 issues in cell "Backend / In Progress"
    And there are 2 issues in cell "Frontend / Review"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "9/10"
    And the cell "Backend / In Progress" should show a badge "9/10"
    And the cell "Frontend / Review" should not show a badge
