Feature: Group Column WIP Limits Settings
  As a board administrator
  I want to manage group WIP limits for columns
  So that I can control workload distribution across column groups

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  # === MODAL CANCEL ===

  @SC1
  Scenario: SC1: Cancel button closes the modal without saving
    Given I have opened the "Limits for groups" modal
    And I have made some changes to the group limits
    When I click "Cancel"
    Then the modal should close
    And the changes should not be saved
