Feature: Column Group WIP Limits on Board
  As a team member
  I want to see visual indicators for column group WIP limits
  So that I can avoid overloading work in progress

  Background:
    Given I am on a Jira board with column limits configured
    And there are available columns:
      | id   | name        |
      | col1 | To Do       |
      | col2 | In Progress |
      | col3 | Review      |
      | col4 | Done        |
    And there are available swimlanes:
      | id   | name       |
      | sw1  | Frontend   |
      | sw2  | Backend    |
      | sw3  | Excluded   |
    And there are available issue types:
      | id   | name  |
      | type1| Bug   |
      | type2| Task  |
      | type3| Story |

  # === DISPLAY ===

  @SC-DISPLAY-1
  Scenario: SC-DISPLAY-1: Show badge X/Y on first column of group
    Given there is a group "Development" with columns "In Progress, Review" and limit 5
    And there are 3 issues in "In Progress"
    And there are 1 issue in "Review"
    When the board is displayed
    Then I should see badge "4/5" on "In Progress" column header

  @SC-DISPLAY-2
  Scenario: SC-DISPLAY-2: Badge updates when issue count changes
    Given there is a group with columns "In Progress" and limit 3
    And there are 2 issues in "In Progress"
    When a new issue appears in "In Progress"
    Then the badge should update to "3/3"

  @SC-DISPLAY-3
  Scenario: SC-DISPLAY-3: Group columns have shared header color
    Given there is a group with columns "In Progress, Review" and custom color "#36B37E"
    When the board is displayed
    Then both "In Progress" and "Review" headers should have border color "#36B37E"

  @SC-DISPLAY-4
  Scenario: SC-DISPLAY-4: Group headers have rounded corners on edges
    Given there is a group with columns "In Progress, Review"
    When the board is displayed
    Then "In Progress" header should have rounded left corner
    And "Review" header should have rounded right corner

  # === LIMIT EXCEEDED ===

  @SC-EXCEED-1
  Scenario: SC-EXCEED-1: Red background when group limit exceeded
    Given there is a group with columns "In Progress" and limit 3
    And there are 5 issues in "In Progress"
    When the board is displayed
    Then "In Progress" column cells should have red background

  @SC-EXCEED-2
  Scenario: SC-EXCEED-2: Normal background when within limit
    Given there is a group with columns "In Progress" and limit 5
    And there are 3 issues in "In Progress"
    When the board is displayed
    Then "In Progress" column cells should have normal background

  @SC-EXCEED-3
  Scenario: SC-EXCEED-3: Exactly at limit shows normal background
    Given there is a group with columns "In Progress" and limit 3
    And there are 3 issues in "In Progress"
    When the board is displayed
    Then "In Progress" column cells should have normal background
    And badge should show "3/3"

  # === SWIMLANE FILTER ===

  @SC-SWIM-1
  Scenario: SC-SWIM-1: Ignore issues in excluded swimlanes
    Given there is a group with columns "In Progress" and limit 2
    And there are 3 issues in "In Progress" swimlane "Frontend"
    And there are 2 issues in "In Progress" swimlane "Excluded"
    And swimlane "Excluded" is set to ignore WIP limits
    When the board is displayed
    Then the badge should show "3/2"
    And the limit should be exceeded

  # === ISSUE TYPE FILTER ===

  @SC-ISSUE-1
  Scenario: SC-ISSUE-1: Count only specified issue types
    Given there is a group with columns "In Progress" and limit 2
    And the group counts only "Bug" issue types
    And there are 3 "Bug" issues in "In Progress"
    And there are 5 "Task" issues in "In Progress"
    When the board is displayed
    Then the badge should show "3/2"

  @SC-ISSUE-2
  Scenario: SC-ISSUE-2: Empty filter counts all issue types
    Given there is a group with columns "In Progress" and limit 5
    And the group has no issue type filter
    And there are 2 "Bug" issues in "In Progress"
    And there are 3 "Task" issues in "In Progress"
    When the board is displayed
    Then the badge should show "5/5"

  # === MULTIPLE GROUPS ===

  @SC-MULTI-1
  Scenario: SC-MULTI-1: Each group has its own badge
    Given there is a group "Dev" with columns "In Progress" and limit 3
    And there is a group "QA" with columns "Review" and limit 2
    When the board is displayed
    Then "In Progress" should have a badge
    And "Review" should have a badge

  @SC-MULTI-2
  Scenario: SC-MULTI-2: Groups can have different colors
    Given there is a group "Dev" with color "#36B37E"
    And there is a group "QA" with color "#FF5630"
    When the board is displayed
    Then "Dev" columns should have green border
    And "QA" columns should have red border

  @SC-MULTI-3
  Scenario: SC-MULTI-3: One group exceeded, another within limit
    Given there is a group "Dev" with columns "In Progress" and limit 2
    And there are 5 issues in "In Progress"
    And there is a group "QA" with columns "Review" and limit 5
    And there are 2 issues in "Review"
    When the board is displayed
    Then "In Progress" cells should have red background
    And "Review" cells should have normal background
