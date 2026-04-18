Feature: WIP Limit on Cells - Cell Background
  As a team member
  I want to see cell background indicate when WIP limit is exceeded
  So that I can quickly identify overloaded cells

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

  @SC-BG-1
  Scenario: Red background on cells exceeding limit
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 3        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | false     |
    And there are 5 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should have class "WipLimit_NotRespected"
    And the cell "Backend / In Progress" should have class "WipLimit_NotRespected"

  @SC-BG-2
  Scenario: No background change when within limit
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | false     |
    And there are 5 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the cell "Frontend / In Progress" should have class "WipLimit_Respected"
    And the cell "Frontend / In Progress" should not have class "WipLimit_NotRespected"
