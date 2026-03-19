Feature: Swimlane WIP Limits - Badge and Highlight

  Визуальное отображение WIP-лимитов на доске.
  Бейдж "count/limit" в заголовке swimlane.
  Подсветка красным при превышении лимита.

  Background:
    Given the board has columns "To Do, In Progress, Done"
    And the board has swimlanes:
      | id  | name     |
      | sw1 | Frontend |
      | sw2 | Backend  |

  @SC-BADGE-1
  Scenario: Show badge with count and limit
    Given swimlane "sw1" has limit 5 for columns "all" with issueTypes "all"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Task      |
      | In Progress | Bug       |
    When the board visuals are rendered
    Then swimlane "sw1" should have a badge "2/5"

  @SC-BADGE-2
  Scenario: Highlight swimlane when limit is exceeded
    Given swimlane "sw1" has limit 2 for columns "all" with issueTypes "all"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Task      |
      | In Progress | Bug       |
      | In Progress | Story     |
    When the board visuals are rendered
    Then swimlane "sw1" should have a badge "3/2"
    And swimlane "sw1" should be highlighted red

  @SC-BADGE-3
  Scenario: No highlight when within limit
    Given swimlane "sw1" has limit 5 for columns "all" with issueTypes "all"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Task      |
    When the board visuals are rendered
    Then swimlane "sw1" should have a badge "1/5"
    And swimlane "sw1" should not be highlighted red

  @SC-BADGE-4
  Scenario: No badge for swimlane without limit
    Given swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Task      |
    When the board visuals are rendered
    Then swimlane "sw1" should not have a badge

  @SC-BADGE-5
  Scenario: Badge respects issue type filter
    Given swimlane "sw1" has limit 5 for columns "all" with issueTypes "Bug"
    And swimlane "sw1" has issues:
      | column      | issueType |
      | In Progress | Bug       |
      | In Progress | Task      |
      | In Progress | Bug       |
    When the board visuals are rendered
    Then swimlane "sw1" should have a badge "2/5"
