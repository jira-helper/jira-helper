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

  # === DRAG AND DROP ===

  @SC2
  Scenario: SC2: Move column from "Without Group" to existing group
    Given I have opened the "Limits for groups" modal
    And there is a column "In Progress" in "Without Group"
    And there is a group with limit 5
    When I drag "In Progress" column to the group
    Then "In Progress" should be in the group
    And "In Progress" should not be in "Without Group"

  @SC3
  Scenario: SC3: Move column from one group to another
    Given I have opened the "Limits for groups" modal
    And there is a column "In Progress" in group "Group A"
    And there is a group "Group B" with limit 3
    When I drag "In Progress" column from "Group A" to "Group B"
    Then "In Progress" should be in "Group B"
    And "In Progress" should not be in "Group A"

  @SC4
  Scenario: SC4: Create new group by dragging column to dropzone
    Given I have opened the "Limits for groups" modal
    And there is a column "Review" in "Without Group"
    When I drag "Review" column to "Create new group" dropzone
    Then a new group should be created
    And "Review" should be in the new group

  @SC5
  Scenario: SC5: Move column back to "Without Group"
    Given I have opened the "Limits for groups" modal
    And there is a column "Done" in a group
    When I drag "Done" column to "Without Group"
    Then "Done" should be in "Without Group"
    And the group should not contain "Done"

  @SC6
  Scenario: SC6: Dropzone highlights on drag over
    Given I have opened the "Limits for groups" modal
    When I start dragging a column
    And I hover over a dropzone
    Then the dropzone should be highlighted
