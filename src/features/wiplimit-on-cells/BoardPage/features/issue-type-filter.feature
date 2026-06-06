Feature: WIP Limit on Cells - Issue Type Filter
  As a team member
  I want to count only specified issue types toward WIP limits
  So that I can track work by type (e.g. Bug, Task) separately from others (e.g. Story)

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

  @SC-FILTER-1
  Scenario: Count only specified issue types (Bug, Task counted; Story not counted)
    Given there is a range "Bugs Only" with:
      | wipLimit | disable | includedIssueTypes |
      | 3        | false   | Bug, Task          |
    And the range "Bugs Only" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And cell "Frontend / In Progress" contains issues:
      | type  |
      | Bug   |
      | Task  |
      | Story |
      | Bug   |
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "3/3"

  @SC-FILTER-2
  Scenario: Count all issues when no type filter is set
    Given there is a range "All Types" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "All Types" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    And cell "Frontend / In Progress" contains issues:
      | type  |
      | Bug   |
      | Task  |
      | Story |
      | Bug   |
      | Task  |
    When the board is displayed
    Then the cell "Frontend / In Progress" should show a badge "5/10"
