Feature: Column Group WIP Limits - Multiple Groups

  Несколько групп колонок с WIP лимитами.
  Каждая группа имеет свой бейдж и цвет.

  @SC-MULTI-1
  Scenario: Each group has its own badge
    Given there are column groups:
      | name     | columns     | limit | color   | issueTypes |
      | Dev      | In Progress | 3     |         |            |
      | QA       | Review      | 2     |         |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | Review      | Frontend | Bug       |
    When the board is displayed
    Then the badge on "In Progress" should show "2/3"
    And the badge on "Review" should show "1/2"

  @SC-MULTI-2
  Scenario: Groups can have different colors
    Given there are column groups:
      | name     | columns     | limit | color   | issueTypes |
      | Dev      | In Progress | 3     | #36B37E |            |
      | QA       | Review      | 2     | #FF5630 |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
    When the board is displayed
    Then "Dev" columns should have "#36B37E" border
    And "QA" columns should have "#FF5630" border

  @SC-MULTI-3
  Scenario: One group exceeded, another within limit
    Given there are column groups:
      | name     | columns     | limit | color   | issueTypes |
      | Dev      | In Progress | 2     |         |            |
      | QA       | Review      | 5     |         |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | Review      | Frontend | Bug       |
    When the board is displayed
    Then the badge on "In Progress" should show "3/2"
    And "In Progress" cells should have red background
    And the badge on "Review" should show "1/5"
    And "Review" cells should have normal background
