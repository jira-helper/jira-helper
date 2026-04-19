Feature: Column Limits Settings Modal Lifecycle

  Жизненный цикл модального окна настроек лимитов колонок.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-MODAL-1
  Scenario: Open modal with empty state
    Given no column groups are configured
    When I open the settings modal
    Then I should see the modal
    And the "Without Group" section should contain all columns
    And there should be no configured groups

  @SC-MODAL-2
  Scenario: Open modal with pre-configured groups
    Given there are configured column groups:
      | name    | columns             | limit |
      | group-1 | In Progress, Review | 5     |
    When I open the settings modal
    Then I should see the modal
    And the "Without Group" section should contain "To Do" and "Done"
    And I should see group "group-1" with columns "In Progress, Review" and limit 5

  @SC-MODAL-3
  Scenario: Cancel button closes modal without saving
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 5
    And I click "Cancel"
    Then I do not see the modal
    And no changes should be saved

  @SC-MODAL-4
  Scenario: Save button persists changes
    Given no column groups are configured
    When I open the settings modal
    And I drag "In Progress" column to create a new group
    And I set limit to 5
    And I click "Save"
    Then I do not see the modal
    And changes should be saved

  @SC-MODAL-5
  Scenario: Open modal when all columns are in groups
    Given there are configured column groups:
      | name    | columns                          | limit |
      | group-1 | To Do, In Progress, Review, Done | 5     |
    When I open the settings modal
    Then the "Without Group" section should be empty
