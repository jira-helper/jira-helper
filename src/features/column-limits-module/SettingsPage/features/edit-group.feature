Feature: Column Limits - Edit Group

  Редактирование существующих групп колонок.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-EDIT-1
  Scenario: Change group limit
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I change group "group-1" limit to 10
    And I click "Save"
    Then group "group-1" should have limit 10 in property

  @SC-EDIT-3
  Scenario: Change group color
    Given there are configured column groups:
      | name    | columns     | limit | color   |
      | group-1 | In Progress | 5     | #FF5630 |
    When I open the settings modal
    And I click color picker for group "group-1"
    And I select color "#36B37E"
    And I click "Save"
    Then group "group-1" should have color "#36B37E" in property

  @SC-EDIT-4
  Scenario: Add issue type filter to group
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I set issue types "Bug, Task" for group "group-1"
    And I click "Save"
    Then group "group-1" should filter by "Bug, Task" in property

  @SC-EDIT-5
  Scenario: Remove issue type filter (count all)
    Given there are configured column groups:
      | name    | columns     | limit | issueTypes |
      | group-1 | In Progress | 5     | Bug        |
    When I open the settings modal
    And I enable "Count all issue types" for group "group-1"
    And I click "Save"
    Then group "group-1" should count all issue types in property
