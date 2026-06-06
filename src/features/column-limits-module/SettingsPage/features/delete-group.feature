Feature: Column Limits - Delete Group

  Удаление групп колонок путём перемещения всех колонок из группы.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-DELETE-1
  Scenario: Delete group by removing all columns
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I drag "In Progress" column to "Without Group"
    Then I should not see group "group-1"

  @SC-DELETE-2
  Scenario: Delete group returns columns to "Without Group"
    Given there are configured column groups:
      | name    | columns             | limit |
      | group-1 | In Progress, Review | 5     |
    When I open the settings modal
    And I drag "In Progress" column to "Without Group"
    And I drag "Review" column to "Without Group"
    Then I should not see group "group-1"
    And the "Without Group" section should contain "In Progress"
    And the "Without Group" section should contain "Review"
