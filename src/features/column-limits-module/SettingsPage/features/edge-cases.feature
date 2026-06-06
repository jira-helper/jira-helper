Feature: Column Limits - Edge Cases

  Граничные случаи работы с группами колонок.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-EDGE-1
  Scenario: Empty groups list shows instruction
    Given no column groups are configured
    When I open the settings modal
    Then I should see instruction to drag columns

  @SC-EDGE-2
  Scenario: All columns in groups leaves "Without Group" empty
    Given there are configured column groups:
      | name    | columns                          | limit |
      | group-1 | To Do, In Progress, Review, Done | 10    |
    When I open the settings modal
    Then the "Without Group" section should be empty

  @SC-EDGE-3
  Scenario: Reorder columns within a group
    Given there are configured column groups:
      | name    | columns             | limit |
      | group-1 | In Progress, Review | 5     |
    When I open the settings modal
    Then group "group-1" should have columns in order "In Progress, Review"
