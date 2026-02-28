Feature: Column Limits - Add Group

  Добавление новых групп колонок с WIP лимитами.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-ADD-1
  Scenario: Create new group by dragging column to dropzone
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    Then I should see a new group with column "In Progress"
    And the "Without Group" section should not contain "In Progress"

  @SC-ADD-2
  Scenario: Create group with multiple columns
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I drag "Review" column to the first group
    Then I should see a group with columns "In Progress, Review"

  @SC-ADD-3
  Scenario: Set limit for new group
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 5
    Then the group should have limit 5

  @SC-ADD-4
  Scenario: Set custom color for group
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I click the color picker button
    And I select color "#36B37E"
    Then the group should have color "#36B37E"

  @SC-ADD-5
  Scenario: Set issue type filter for group
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I select issue types "Bug, Task"
    Then the group should filter by "Bug, Task"
