Feature: Column Limits - Validation

  Валидация ввода лимитов для групп колонок.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-VALID-1
  Scenario: Limit must be a positive integer (minimum 1)
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 1
    And I try to set limit to 0
    Then the limit input should show value 1

  @SC-VALID-2
  Scenario: Cannot set negative limit
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 1
    And I try to set limit to -5
    Then the limit input should show value 1

  @SC-VALID-3
  Scenario: Limit accepts only integers
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 1
    And I type "abc" into limit input
    Then the limit input should show value 1
