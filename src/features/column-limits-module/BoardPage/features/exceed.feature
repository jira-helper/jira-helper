Feature: Column Group WIP Limits - Limit Exceeded

  Визуальная индикация при превышении лимита группы.
  Ячейки колонок группы становятся красными при превышении.

  @SC-EXCEED-1
  Scenario: Red background when group limit exceeded
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
      | In Progress | Backend  | Task      |
      | In Progress | Frontend | Task      |
    When the board is displayed
    Then "In Progress" column cells should have red background

  @SC-EXCEED-2
  Scenario: Normal background when within limit
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 5     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
    When the board is displayed
    Then "In Progress" column cells should have normal background

  @SC-EXCEED-3
  Scenario: Exactly at limit shows normal background
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
    When the board is displayed
    Then "In Progress" column cells should have normal background
    And the badge should show "3/3"
