Feature: Column Group WIP Limits - Display

  Отображение бейджей X/Y на заголовках колонок группы.
  Бейдж показывается на первой колонке группы.

  @SC-DISPLAY-1
  Scenario: Show badge X/Y on first column of group
    Given there are column groups:
      | name        | columns             | limit | color | issueTypes |
      | Development | In Progress, Review | 5     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
      | In Progress | Backend  | Task      |
      | Review      | Frontend | Task      |
    When the board is displayed
    Then the badge on "In Progress" should show "4/5"

  @SC-DISPLAY-2
  Scenario: Badge updates when issue count changes
    Given there are column groups:
      | name | columns     | limit | color | issueTypes |
      | Dev  | In Progress | 3     |       |            |
    Given the board has issues:
      | column      | swimlane | issueType |
      | In Progress | Frontend | Task      |
      | In Progress | Frontend | Task      |
    When the board is displayed
    When a new issue appears in "In Progress"
    Then the badge on "In Progress" should show "3/3"

  @SC-DISPLAY-3
  Scenario: Group columns have shared header color
    Given there are column groups:
      | name | columns             | limit | color   | issueTypes |
      | Dev  | In Progress, Review | 5     | #36B37E |            |
    When the board is displayed
    Then "In Progress" and "Review" headers should have border color "#36B37E"
