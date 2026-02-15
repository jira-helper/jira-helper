Feature: Personal WIP Limit Settings
  As a team lead
  I want to manage personal WIP limits for team members
  So that I can control workload distribution

  Background:
    Given I am on the Personal WIP Limits settings page
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  # === MODAL LIFECYCLE ===

  @SC-MODAL-1
  Scenario: SC-MODAL-1: Open modal with empty state and default form values
    Given there are no limits configured
    When I click "Manage per-person WIP-limits" button
    Then I should see the Personal WIP Limits modal
    And I should see an empty limits table
    And I should see the avatar warning message
    And the person name field should be empty
    And the limit field should show value 1
    And "All columns" checkbox should be checked
    And "All swimlanes" checkbox should be checked
    And "Count all issue types" checkbox should be checked
    When I click "Save"
    Then the modal should be closed

  @SC-MODAL-2
  Scenario: SC-MODAL-2: Open modal with pre-configured limits
    Given there is a limit for "alice" with value 3 for all columns and all swimlanes
    And there is a limit for "bob" with value 5 for columns "To Do, In Progress" only
    And there is a limit for "charlie" with value 2 for swimlane "Frontend" only
    And there is a limit for "diana" with value 4 for issue types "Task, Bug" only
    And there is a limit for "eve" with value 6 for columns "In Progress", swimlane "Backend" and issue types "Story"
    When I click "Manage per-person WIP-limits" button
    Then I should see the Personal WIP Limits modal
    And I should see 5 limits in the table
    And I should see limit for "alice" with value 3 and "All" columns and "All" swimlanes
    And I should see limit for "bob" with value 5 and columns "To Do, In Progress"
    And I should see limit for "charlie" with value 2 and swimlane "Frontend"
    And I should see limit for "diana" with value 4 and issue types "Task, Bug"
    And I should see limit for "eve" with value 6, column "In Progress", swimlane "Backend" and issue types "Story"
    When I click "Cancel"
    Then the modal should be closed

  # === ADD LIMIT ===

  ## Basic

  @SC-ADD-1
  Scenario: SC-ADD-1: Add a new limit for a person
    When I enter person name "john.doe"
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "john.doe" in the limits list
    And the limit should show value 5

  ## Column filtering

  @SC-ADD-2
  Scenario: SC-ADD-2: Add a limit for specific columns only
    When I enter person name "jane.doe"
    And I set the limit to 3
    And I select only columns "To Do, In Progress"
    And I click "Add limit"
    Then the limit for "jane.doe" should apply only to "To Do, In Progress"

  ## Swimlane filtering

  @SC-ADD-3
  Scenario: SC-ADD-3: Add a limit for specific swimlanes only
    When I enter person name "john.doe"
    And I set the limit to 5
    And I select only swimlane "Frontend"
    And I click "Add limit"
    Then the limit for "john.doe" should apply only to swimlane "Frontend"

  ## Issue type filtering

  @SC-ADD-4
  Scenario: SC-ADD-4: Add a limit for specific issue types only
    When I enter person name "john.doe"
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then the limit for "john.doe" should count only "Task, Bug" issues

  ## Combined filters

  @SC-ADD-5
  Scenario: SC-ADD-5: Add a limit with columns, swimlanes and issue types
    When I enter person name "john.doe"
    And I set the limit to 4
    And I select only columns "In Progress"
    And I select only swimlane "Backend"
    And I uncheck "Count all issue types"
    And I select issue types "Story"
    And I click "Add limit"
    Then the limit for "john.doe" should apply to column "In Progress", swimlane "Backend" and issue types "Story"

  @SC-ADD-6
  Scenario: SC-ADD-6: Add multiple limits for same person with different columns
    Given there is a limit for "john.doe" with value 3 for column "To Do"
    When I enter person name "john.doe"
    And I set the limit to 5
    And I select only column "In Progress"
    And I click "Add limit"
    Then I should see two limits for "john.doe"
    And one limit should show value 3 for "To Do"
    And another limit should show value 5 for "In Progress"

  ## Validation

  @SC-ADD-7
  Scenario: SC-ADD-7: Cannot add limit without person name
    When I set the limit to 5
    And I click "Add limit"
    Then I should see a validation error for person name

  @SC-ADD-8
  Scenario: SC-ADD-8: Cannot add limit with zero value
    When I enter person name "john.doe"
    And I set the limit to 0
    And I click "Add limit"
    Then I should see a validation error for limit value

  @SC-ADD-9
  Scenario: SC-ADD-9: Cannot add duplicate limit
    Given there is a limit for "john.doe" with value 5 for all columns and all swimlanes
    When I enter person name "john.doe"
    And I set the limit to 3
    And I click "Add limit"
    Then I should see a validation error for duplicate limit

  # === EDIT LIMIT ===

  ## Basic

  @SC-EDIT-1
  Scenario: SC-EDIT-1: Edit shows current values
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    Then I should see "john.doe" in the person name field
    And I should see 5 in the limit field
    And the button should show "Edit limit"

  @SC-EDIT-2
  Scenario: SC-EDIT-2: Update limit value
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I change the limit to 10
    And I click "Edit limit"
    Then the limit for "john.doe" should show value 10

  @SC-EDIT-3
  Scenario: SC-EDIT-3: Change person name
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I change person name to "jane.doe"
    And I click "Edit limit"
    Then I should see "jane.doe" in the limits list
    And "john.doe" should not be in the limits list

  ## Progressive complexity (add filters step by step)

  @SC-EDIT-4
  Scenario: SC-EDIT-4: Add swimlane filter to existing simple limit
    Given there is a limit for "john.doe" with value 5 for all columns and all swimlanes
    When I click "Edit" on the limit for "john.doe"
    And I select only swimlane "Frontend"
    And I click "Edit limit"
    Then the limit for "john.doe" should apply only to swimlane "Frontend" and limit value is 5

  @SC-EDIT-5
  Scenario: SC-EDIT-5: Add column filter to limit with swimlane
    Given there is a limit for "john.doe" with value 5 for swimlane "Frontend" only
    When I click "Edit" on the limit for "john.doe"
    And I select only columns "To Do, In Progress"
    And I click "Edit limit"
    Then the limit for "john.doe" should apply to columns "To Do, In Progress" and swimlane "Frontend" and limit value is 5

  @SC-EDIT-6
  Scenario: SC-EDIT-6: Add issue type filter to limit with columns and swimlane
    Given there is a limit for "john.doe" with value 5 for columns "To Do, In Progress" and swimlane "Frontend"
    When I click "Edit" on the limit for "john.doe"
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Edit limit"
    Then the limit for "john.doe" should apply to columns "To Do, In Progress", swimlane "Frontend" and issue types "Task, Bug" and limit value is 5

  ## Remove filters (expand to all)

  @SC-EDIT-7
  Scenario: SC-EDIT-7: Expand columns filter to all columns
    Given there is a limit for "john.doe" with value 5 for columns "To Do, In Progress" only
    When I click "Edit" on the limit for "john.doe"
    And I check "All columns"
    And I click "Edit limit"
    Then the limit for "john.doe" should apply to all columns

  @SC-EDIT-8
  Scenario: SC-EDIT-8: Expand swimlanes filter to all swimlanes
    Given there is a limit for "john.doe" with value 5 for swimlane "Frontend" only
    When I click "Edit" on the limit for "john.doe"
    And I check "All swimlanes"
    And I click "Edit limit"
    Then the limit for "john.doe" should apply to all swimlanes

  @SC-EDIT-9
  Scenario: SC-EDIT-9: Expand issue types filter to all issue types
    Given there is a limit for "john.doe" with value 5 for issue types "Task, Bug" only
    When I click "Edit" on the limit for "john.doe"
    And I check "Count all issue types"
    And I click "Edit limit"
    Then the limit for "john.doe" should count all issue types

  ## Preserve filters

  @SC-EDIT-10
  Scenario: SC-EDIT-10: Edit limit preserves issue type filter
    Given there is a limit for "john.doe" with issue types "Task, Bug"
    When I click "Edit" on the limit for "john.doe"
    Then issue types "Task, Bug" should be selected
    And "Count all issue types" should be unchecked

  ## Cancel

  @SC-EDIT-11
  Scenario: SC-EDIT-11: Cancel editing returns to add mode
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I change the limit to 10
    And I select only swimlane "Frontend"
    And I select only columns "To Do, In Progress"
    And I click cancel editing
    Then the button should show "Add limit"
    And the limit for "john.doe" should still show value 5

  ## Validation

  @SC-EDIT-12
  Scenario: SC-EDIT-12: Cannot save edit with zero value
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I set the limit to 0
    And I click "Edit limit"
    Then I should see a validation error for limit value
    And the limit for "john.doe" should still show value 5

  # === DELETE LIMIT ===

  @SC-DELETE-1
  Scenario: SC-DELETE-1: Delete a limit
    Given there is a limit for "john.doe"
    When I click "Delete" on the limit for "john.doe"
    Then "john.doe" should not be in the limits list

  # === MASS OPERATIONS ===

  @SC-MASS-1
  Scenario: SC-MASS-1: Apply columns to multiple limits at once
    Given there are limits for "john.doe" and "jane.doe"
    When I select both limits
    And I click "Apply columns for selected users"
    And I choose only column "To Do"
    Then both limits should apply only to "To Do"

  @SC-MASS-2
  Scenario: SC-MASS-2: Apply swimlanes to multiple limits at once
    Given there are limits for "john.doe" and "jane.doe"
    When I select both limits
    And I click "Apply swimlanes for selected users"
    And I choose only swimlane "Backend"
    Then both limits should apply only to swimlane "Backend"
