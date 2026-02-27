Feature: Column Group WIP Limits Settings
  As a board administrator
  I want to manage group WIP limits for columns
  So that I can control workload distribution across column groups

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are issue types "Task, Bug, Story" available

  # === MODAL LIFECYCLE ===

  @SC-MODAL-1
  Scenario: SC-MODAL-1: Open modal with empty state
    Given there are no column groups configured
    When I open the "Limits for groups" modal
    Then I should see the modal is open
    And I should see all columns in "Without Group" section
    And I should see no groups configured
    And I should see "Create new group" dropzone

  @SC-MODAL-2
  Scenario: SC-MODAL-2: Open modal with pre-configured groups
    Given there is a group with columns "In Progress, Review" and limit 5
    And there is a group with columns "To Do" and limit 3
    When I open the "Limits for groups" modal
    Then I should see 2 groups configured
    And the first group should contain "In Progress, Review" with limit 5
    And the second group should contain "To Do" with limit 3
    And "Done" should be in "Without Group" section

  @SC-MODAL-3
  Scenario: SC-MODAL-3: Cancel button closes modal without saving
    Given I have opened the "Limits for groups" modal
    And I have made some changes to the group limits
    When I click "Cancel"
    Then the modal should close
    And the changes should not be saved

  @SC-MODAL-4
  Scenario: SC-MODAL-4: Save button persists changes
    Given I have opened the "Limits for groups" modal
    And I have created a new group with "In Progress" column
    When I click "Save"
    Then the modal should close
    And the changes should be saved

  @SC-MODAL-5
  Scenario: SC-MODAL-5: Open modal with pre-configured groups and no columns in "Without Group"
    Given there is a group with columns "In Progress, Review" and limit 5
    And there is a group with columns "To Do, Done" and limit 3
    When I open the "Limits for groups" modal
    Then I should see 2 groups configured
    And the first group should contain "In Progress, Review" with limit 5
    And the second group should contain "To Do, Done" with limit 3
    And "Without Group" section is empty

  # === ADD GROUP ===

  ## Basic
  @SC-ADD-1
  Scenario: SC-ADD-1: Create new group by dragging column to dropzone
    Given I have opened the "Limits for groups" modal
    And there is a column "Review" in "Without Group"
    When I drag "Review" column to "Create new group" dropzone
    Then a new group should be created
    And "Review" should be in the new group
    And "Without Group" should not contain Review
    And the new group should have default limit 100

  @SC-ADD-2
  Scenario: SC-ADD-2: Create group with multiple columns
    Given I have opened the "Limits for groups" modal
    And there is a column "In Progress" in "Without Group"
    And there is a column "Review" in "Without Group"
    When I drag "In Progress" column to "Create new group" dropzone
    And I drag "Review" column to the new group
    Then the group should contain "In Progress, Review"
    And "Without Group" should not contain "In Progress, Review"

  ## With limit
  @SC-ADD-3
  Scenario: SC-ADD-3: Set limit for new group
    Given I have opened the "Limits for groups" modal
    And I have created a new group with "In Progress" column
    When I set the group limit to 5
    Then the group should have limit 5
    And "Without Group" should not contain "In Progress"

  ## With color
  @SC-ADD-4
  Scenario: SC-ADD-4: Set custom color for group
    Given I have opened the "Limits for groups" modal
    And I have created a new group with "In Progress" column
    When I open color picker for the group
    And I select color "#FF5630"
    Then the group should have color "#FF5630"

  ## With issue type filter
  @SC-ADD-5
  Scenario: SC-ADD-5: Set issue type filter for group
    Given I have opened the "Limits for groups" modal
    And I have created a new group with "In Progress" column
    When I open issue type selector for the group
    And I select only issue types "Bug, Task"
    Then the group should count only "Bug, Task" issues

  # === DRAG AND DROP ===

  ## Move to existing group
  @SC-DND-1
  Scenario: SC-DND-1: Move column from "Without Group" to existing group
    Given I have opened the "Limits for groups" modal
    And there is a column "In Progress" in "Without Group"
    And there is a group with limit 5
    When I drag "In Progress" column to the group
    Then "In Progress" should be in the group
    And "In Progress" should not be in "Without Group"

  @SC-DND-2
  Scenario: SC-DND-2: Move column from one group to another
    Given I have opened the "Limits for groups" modal
    And there is a column "In Progress" in group "Group A"
    And there is a group "Group B" with limit 3
    When I drag "In Progress" column from "Group A" to "Group B"
    Then "In Progress" should be in "Group B"
    And "In Progress" should not be in "Group A"

  @SC-DND-3
  Scenario: SC-DND-3: Move column back to "Without Group"
    Given I have opened the "Limits for groups" modal
    And there is a column "Done" in a group
    When I drag "Done" column to "Without Group"
    Then "Done" should be in "Without Group"
    And the group should not contain "Done"

  ## Visual feedback
  @SC-DND-4
  Scenario: SC-DND-4: Dropzone highlights on drag over
    Given I have opened the "Limits for groups" modal
    When I start dragging a column
    And I hover over a dropzone
    Then the dropzone should be highlighted

  @SC-DND-5
  Scenario: SC-DND-5: Dragged column shows drag preview
    Given I have opened the "Limits for groups" modal
    When I start dragging "In Progress" column
    Then I should see a drag preview of "In Progress"

  # === EDIT GROUP ===

  ## Limit
  @SC-EDIT-1
  Scenario: SC-EDIT-1: Change group limit
    Given I have opened the "Limits for groups" modal
    And there is a group with columns "In Progress, Review" and limit 5
    When I change the group limit to 10
    Then the group should have limit 10

  ## Color
  @SC-EDIT-3
  Scenario: SC-EDIT-3: Change group color
    Given I have opened the "Limits for groups" modal
    And there is a group with custom color "#FF5630"
    When I open color picker for the group
    And I select color "#36B37E"
    Then the group should have color "#36B37E"

  ## Issue types
  @SC-EDIT-4
  Scenario: SC-EDIT-4: Add issue type filter to group
    Given I have opened the "Limits for groups" modal
    And there is a group counting all issue types
    When I open issue type selector for the group
    And I select only issue types "Bug"
    Then the group should count only "Bug" issues

  @SC-EDIT-5
  Scenario: SC-EDIT-5: Remove issue type filter (count all)
    Given I have opened the "Limits for groups" modal
    And there is a group counting only "Bug, Task" issues
    When I open issue type selector for the group
    And I select "Count all issue types"
    Then the group should count all issue types

  # === DELETE GROUP ===

  @SC-DELETE-1
  Scenario: SC-DELETE-1: Delete group by removing all columns
    Given I have opened the "Limits for groups" modal
    And there is a group with only column "In Progress"
    When I drag "In Progress" column to "Without Group"
    Then the group should be removed
    And "In Progress" should be in "Without Group"

  @SC-DELETE-2
  Scenario: SC-DELETE-2: Delete group returns columns to "Without Group"
    Given I have opened the "Limits for groups" modal
    And there is a group with columns "In Progress, Review"
    When I drag "In Progress" to "Without Group"
    And I drag "Review" to "Without Group"
    Then the group should be removed
    And "In Progress" should be in "Without Group"
    And "Review" should be in "Without Group"

  # === VALIDATION ===

  @SC-VALID-1
  Scenario: SC-VALID-1: Limit must be a positive integer (minimum 1)
    Given I have opened the "Limits for groups" modal
    And there is a group with limit 5
    When I try to set the group limit to 0
    Then the limit should remain 5
    Or the input should reject the value

  @SC-VALID-2
  Scenario: SC-VALID-2: Cannot set negative limit
    Given I have opened the "Limits for groups" modal
    And there is a group with limit 5
    When I try to set the group limit to -1
    Then the limit should remain 5
    Or the input should reject the value

  @SC-VALID-3
  Scenario: SC-VALID-3: Limit accepts only integers
    Given I have opened the "Limits for groups" modal
    And there is a group with limit 5
    When I try to set the group limit to 3.5
    Then the limit should be rounded to 4 or rejected

  # === EDGE CASES ===

  @SC-EDGE-1
  Scenario: SC-EDGE-1: Empty groups list shows instruction
    Given I have opened the "Limits for groups" modal
    And all columns are in "Without Group"
    Then I should see instruction to drag columns to create groups

  @SC-EDGE-2
  Scenario: SC-EDGE-2: All columns in groups leaves "Without Group" empty
    Given I have opened the "Limits for groups" modal
    And all columns are assigned to groups
    Then "Without Group" section should be empty
    And I should still be able to move columns back

  @SC-EDGE-3
  Scenario: SC-EDGE-3: Reorder columns within a group
    Given I have opened the "Limits for groups" modal
    And there is a group with columns "In Progress, Review" in that order
    When I drag "Review" before "In Progress" within the group
    Then the group should have columns "Review, In Progress" in that order
