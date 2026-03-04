Feature: WIP Limit on Cells - Multiple Ranges and Dynamic Update
  As a team member
  I want to see multiple WIP ranges displayed independently and updated when issues move
  So that I can monitor several cell groups and see real-time changes

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

  @SC-MULTI-1
  Scenario: Multiple ranges displayed independently
    Given there is a range "Range A" with:
      | wipLimit | disable |
      | 3        | false   |
    And the range "Range A" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there is a range "Range B" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Range B" has cells:
      | swimlane | column | showBadge |
      | Backend  | Review | true      |
    And there are 4 issues in cell "Frontend / In Progress"
    And there are 2 issues in cell "Backend / Review"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "4/3"
    And the cell "Frontend / In Progress" should have class "WipLimit_NotRespected"
    And the cell "Backend / Review" should show a badge "2/5"
    And the cell "Backend / Review" should have class "WipLimit_Respected"

  @SC-UPDATE-1
  Scenario: Board updates when issues are moved (added)
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 3        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there are 2 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "2/3"
    When an issue is added to cell "Frontend / In Progress"
    And the board is re-rendered
    Then the cell "Frontend / In Progress" should show a badge "3/3"

  @SC-UPDATE-2
  Scenario: Board updates when issues are removed
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 3        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there are 4 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "4/3"
    When an issue is removed from cell "Frontend / In Progress"
    And the board is re-rendered
    Then the cell "Frontend / In Progress" should show a badge "3/3"
