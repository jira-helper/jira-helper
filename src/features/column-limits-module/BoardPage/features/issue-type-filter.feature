Feature: Column Group WIP Limits - Issue Type Filter

  Фильтрация задач по типам задач.
  Можно считать только определённые типы задач.
  Пустой фильтр = все типы.

  @SC-ISSUE-1
  Scenario: Count only specified issue types
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 2     |       | Bug        |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Bug       |
      | In Progress | Frontend | Bug       |
    When the board is displayed
    Then the badge on "In Progress" should show "2/2"
    And "In Progress" cells should have normal background

  @SC-ISSUE-2
  Scenario: Empty filter counts all issue types
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Bug       |
      | In Progress | Frontend | Story     |
    When the board is displayed
    Then the badge on "In Progress" should show "3/3"
    And "In Progress" cells should have normal background
