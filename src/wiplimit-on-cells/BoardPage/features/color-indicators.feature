Feature: WIP Limit on Cells - Color Indicators
  As a team member
  I want to see color-coded badges reflecting WIP limit status
  So that I can quickly identify cells within, at, or exceeding their limits

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

  @SC-COLOR-1
  Scenario: Green badge when within limit
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there are 3 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the badge in cell "Frontend / In Progress" should have green background color "#1b855c"

  @SC-COLOR-2
  Scenario: Yellow badge when at limit
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there are 5 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the badge in cell "Frontend / In Progress" should have yellow background color "#ffd700"

  @SC-COLOR-3
  Scenario: Red badge when exceeding limit
    Given there is a range "My Range" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "My Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And there are 7 issues in cell "Frontend / In Progress"
    When the board is displayed
    Then the badge in cell "Frontend / In Progress" should have red background color "#ff5630"
