Feature: Swimlane WIP Limits - Issue Type Filter

  Фильтрация задач по типам при подсчёте WIP-лимитов swimlane.
  Позволяет считать только определённые типы задач (Bug, Task и т.д.).
  includedIssueTypes: undefined = все типы, [] = никакие.

  Background:
    Given the board has columns "To Do, In Progress, Done"
    And the board has swimlanes:
      | id  | name     |
      | sw1 | Frontend |
      | sw2 | Backend  |

  @SC-FILTER-1
  Scenario: Count only specified issue types
    Given swimlane "sw1" has limit 3 for columns "all" with issueTypes "Bug, Task"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
      | In Progress | Story     |
      | In Progress | Bug       |
    When the board stats are calculated
    Then swimlane "sw1" count should be 3
    And swimlane "sw1" should not be over limit

  @SC-FILTER-2
  Scenario: Count all issues when no type filter is set
    Given swimlane "sw1" has limit 5 for columns "all" with issueTypes "all"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
      | In Progress | Story     |
    When the board stats are calculated
    Then swimlane "sw1" count should be 3
    And swimlane "sw1" should not be over limit

  @SC-FILTER-3
  Scenario: Exceed limit with filtered types
    Given swimlane "sw1" has limit 2 for columns "all" with issueTypes "Bug"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Bug       |
      | In Progress | Bug       |
      | In Progress | Task      |
    When the board stats are calculated
    Then swimlane "sw1" count should be 3
    And swimlane "sw1" should be over limit

  @SC-FILTER-4
  Scenario: Filter applies only to configured swimlane
    Given swimlane "sw1" has limit 5 for columns "all" with issueTypes "Bug"
    And swimlane "sw2" has limit 5 for columns "all" with issueTypes "all"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
    And swimlane "sw2" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
    When the board stats are calculated
    Then swimlane "sw1" count should be 1
    And swimlane "sw2" count should be 2

  @SC-FILTER-5
  Scenario: Filter combined with column filter
    Given swimlane "sw1" has limit 5 for columns "In Progress" with issueTypes "Bug"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
      | To Do       | Bug       |
    When the board stats are calculated
    Then swimlane "sw1" count should be 1
