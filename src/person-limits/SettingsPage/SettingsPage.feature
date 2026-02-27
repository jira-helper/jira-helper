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
    And the person name select should be empty
    And the limit field should show value 1
    And "All columns" checkbox should be checked
    And "All swimlanes" checkbox should be checked
    And "Count all issue types" checkbox should be checked
    When I click "Save"
    Then the modal should be closed

  @SC-MODAL-2
  Scenario: SC-MODAL-2: Open modal with pre-configured limits
    Given there is a limit for "alice" (Alice Smith) with value 3 for all columns and all swimlanes
    And there is a limit for "bob" (Bob Johnson) with value 5 for columns "To Do, In Progress" only
    And there is a limit for "charlie" (Charlie Brown) with value 2 for swimlane "Frontend" only
    And there is a limit for "diana" (Diana Prince) with value 4 for issue types "Task, Bug" only
    And there is a limit for "eve" (Eve Wilson) with value 6 for columns "In Progress", swimlane "Backend" and issue types "Story"
    When I click "Manage per-person WIP-limits" button
    Then I should see the Personal WIP Limits modal
    And I should see 5 limits in the table
    And I should see limit for "Alice Smith" with value 3 and "All" columns, "All" swimlanes and "All" issue types
    And I should see limit for "Bob Johnson" with value 5 and columns "To Do, In Progress"
    And I should see limit for "Charlie Brown" with value 2 and swimlane "Frontend"
    And I should see limit for "Diana Prince" with value 4 and issue types "Task, Bug"
    And I should see limit for "Eve Wilson" with value 6, column "In Progress", swimlane "Backend" and issue types "Story"
    When I click "Cancel"
    Then the modal should be closed

  # === PERSON SEARCH ===

  @SC-SEARCH-1
  Scenario: SC-SEARCH-1: Search shows matching users with avatars
    When I type "john" in person name field
    Then I should see a dropdown with matching users
    And each option should show avatar, display name and login

  @SC-SEARCH-2
  Scenario: SC-SEARCH-2: Search debounces API calls
    When I type "j" in person name field
    Then I should not see a dropdown (min 2 characters)
    When I type "jo" in person name field
    Then I should see a loading indicator
    And then I should see search results

  @SC-SEARCH-3
  Scenario: SC-SEARCH-3: No users found
    When I search for "zzzznonexistent" in person name field
    Then I should see "No users found" in the dropdown

  @SC-SEARCH-4
  Scenario: SC-SEARCH-4: API error during search
    Given the user search API will fail
    When I search for "john" in person name field
    Then I should see "Search failed, try again" in the dropdown
    And the form should remain functional

  @SC-SEARCH-5
  Scenario: SC-SEARCH-5: Select user from search results
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    Then I should see "John Doe" as selected person
    And the limit form should be ready to submit

  @SC-SEARCH-6
  Scenario: SC-SEARCH-6: Edit mode shows current person in select
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe (john.doe)"

  # === ADD LIMIT ===

  ## Basic

  @SC-ADD-1
  Scenario: SC-ADD-1: Add a new limit for a person
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "John Doe" in the limits list
    And the limit should show value 5
    And the form should be reset to default values (empty person name, limit 1, all columns, all swimlanes, all issue types)

  ## Column filtering

  @SC-ADD-2
  Scenario: SC-ADD-2: Add a limit for specific columns only
    When I search for "jane" in person name field
    And I select "Jane Doe (jane.doe)" from search results
    And I set the limit to 3
    And I select only columns "To Do, In Progress"
    And I click "Add limit"
    Then the limit for "Jane Doe" should apply only to "To Do, In Progress"

  ## Swimlane filtering

  @SC-ADD-3
  Scenario: SC-ADD-3: Add a limit for specific swimlanes only
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I select only swimlane "Frontend"
    And I click "Add limit"
    Then the limit for "John Doe" should apply only to swimlane "Frontend"

  ## Issue type filtering

  @SC-ADD-4
  Scenario: SC-ADD-4: Add a limit for specific issue types only
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then the limit for "John Doe" should count only "Task, Bug" issues
    And the form should be reset to default values (empty person name, all swimlanes, all columns, all issue types)

  ## Combined filters

  @SC-ADD-5
  Scenario: SC-ADD-5: Add a limit with columns, swimlanes and issue types
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 4
    And I select only columns "In Progress"
    And I select only swimlane "Backend"
    And I uncheck "Count all issue types"
    And I select issue types "Story"
    And I click "Add limit"
    Then the limit for "John Doe" should apply to column "In Progress", swimlane "Backend" and issue types "Story"

  @SC-ADD-6
  Scenario: SC-ADD-6: Add multiple limits for same person with different columns
    Given there is a limit for "john.doe" (John Doe) with value 3 for column "To Do"
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I select only column "In Progress"
    And I click "Add limit"
    Then I should see two limits for "John Doe"
    And one limit should show value 3 for "To Do"
    And another limit should show value 5 for "In Progress"

  ## Validation

  @SC-ADD-7
  Scenario: SC-ADD-7: Cannot add limit without selecting a person
    When I set the limit to 5
    And I click "Add limit"
    Then I should see a validation error for person name
    And the person name field should have error highlight
    And I should see error message "Select a person"
    And I don't see new limit in the table

  @SC-ADD-8
  Scenario: SC-ADD-8: Cannot add limit with zero value
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 0
    Then I see 1 in input

  @SC-ADD-9
  Scenario: SC-ADD-9: Cannot add duplicate limit
    Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I click "Add limit"
    Then I should see a validation error for duplicate limit
    And the limit should not be added to the list
    And the existing limit for "John Doe" should still show value 5
    And there is only 1 limit for "John Doe"

  @SC-ADD-9a
  Scenario: SC-ADD-9a: Cannot add duplicate limit with same issue types
    Given there is a limit for "john.doe" (John Doe) with value 5 for issue types "Task, Bug"
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then I should see a validation error for duplicate limit
    And there is only 1 limit for "John Doe"

  @SC-ADD-10
  Scenario: SC-ADD-10: Validation error clears when switching to edit mode
    Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes
    When I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I click "Add limit"
    Then I should see a validation error for duplicate limit
    When I click "Edit" on the limit for "John Doe"
    Then the person name field should not have error highlight
    And I should not see error message "A limit with the same filters already exists for this person"

  # === EDIT LIMIT ===

  ## Basic

  @SC-EDIT-1
  Scenario: SC-EDIT-1: Edit shows current values
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe (john.doe)"
    And I should see 5 in the limit field
    And the button should show "Edit limit"

  @SC-EDIT-2
  Scenario: SC-EDIT-2: Update limit value
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    And I change the limit to 10
    And I click "Edit limit"
    Then the limit for "John Doe" should show value 10

  @SC-EDIT-3
  Scenario: SC-EDIT-3: Change person
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    And I search for "jane" in person name field
    And I select "Jane Doe (jane.doe)" from search results
    And I click "Edit limit"
    Then I should see "Jane Doe" in the limits list
    And "John Doe" should not be in the limits list

  ## Progressive complexity (add filters step by step)

  @SC-EDIT-4
  Scenario: SC-EDIT-4: Add swimlane filter to existing simple limit
    Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes
    When I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe (john.doe)"
    And I see "5" in limit count input
    And I see checkbox "all swimlanes" is checked
    And I see checkbox "all columns" is checked
    When I click checkbox "all swimlanes"
    Then I see checkbox "all columns" is checked
    And I see list of checkboxes in swimlanes with checked Frontend, Backend
    When I click checkbox Backend
    Then I see checkbox Frontend is checked
    And I see checkbox Backend is unchecked
    When I click "Edit limit"
    Then the limit for "John Doe" should apply only to swimlane "Frontend", all columns and limit value is 5

  @SC-EDIT-5
  Scenario: SC-EDIT-5: Add column filter to limit with swimlane
    Given there is a limit for "john.doe" (John Doe) with value 5 for swimlane "Frontend" only
    When I click "Edit" on the limit for "John Doe"
    And I select only columns "To Do, In Progress"
    And I click "Edit limit"
    Then the limit for "John Doe" should apply to columns "To Do, In Progress" and swimlane "Frontend" and limit value is 5

  @SC-EDIT-5a
  Scenario: SC-EDIT-5a: Changing swimlane filter does not affect column filter
    Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes
    When I click "Edit" on the limit for "John Doe"
    And I uncheck "All swimlanes"
    Then "All columns" should still be checked
    And the columns selection should not change

  @SC-EDIT-6
  Scenario: SC-EDIT-6: Add issue type filter to limit with columns and swimlane
    Given there is a limit for "john.doe" (John Doe) with value 5 for columns "To Do, In Progress" and swimlane "Frontend"
    When I click "Edit" on the limit for "John Doe"
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Edit limit"
    Then the limit for "John Doe" should apply to columns "To Do, In Progress", swimlane "Frontend" and issue types "Task, Bug" and limit value is 5

  ## Remove filters (expand to all)

  @SC-EDIT-7
  Scenario: SC-EDIT-7: Expand columns filter to all columns
    Given there is a limit for "john.doe" (John Doe) with value 5 for columns "To Do, In Progress" only
    When I click "Edit" on the limit for "John Doe"
    And I check "All columns"
    And I click "Edit limit"
    Then the limit for "John Doe" should apply to all columns

  @SC-EDIT-8
  Scenario: SC-EDIT-8: Expand swimlanes filter to all swimlanes
    Given there is a limit for "john.doe" (John Doe) with value 5 for swimlane "Frontend" only
    When I click "Edit" on the limit for "John Doe"
    And I check "All swimlanes"
    And I click "Edit limit"
    Then the limit for "John Doe" should apply to all swimlanes

  @SC-EDIT-9
  Scenario: SC-EDIT-9: Expand issue types filter to all issue types
    Given there is a limit for "john.doe" (John Doe) with value 5 for issue types "Task, Bug" only
    When I click "Edit" on the limit for "John Doe"
    And I check "Count all issue types"
    And I click "Edit limit"
    Then the limit for "John Doe" should count all issue types

  ## Preserve filters

  @SC-EDIT-10
  Scenario: SC-EDIT-10: Edit limit preserves issue type filter
    Given there is a limit for "john.doe" (John Doe) with issue types "Task, Bug"
    When I click "Edit" on the limit for "John Doe"
    Then issue types "Task, Bug" should be selected
    And "Count all issue types" should be unchecked

  ## Cancel

  @SC-EDIT-11
  Scenario: SC-EDIT-11: Cancel editing returns to add mode
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    And I change the limit to 10
    And I select only swimlane "Frontend"
    And I select only columns "To Do, In Progress"
    And I click cancel editing
    Then the button should show "Add limit"
    And the limit for "John Doe" should still show value 5

  ## Validation

  @SC-EDIT-12
  Scenario: SC-EDIT-12: Zero value is auto-corrected to minimum in edit mode
    Given there is a limit for "john.doe" (John Doe) with value 5
    When I click "Edit" on the limit for "John Doe"
    And I set the limit to 0
    Then the limit field should show value 1

  # === DELETE LIMIT ===

  @SC-DELETE-1
  Scenario: SC-DELETE-1: Delete a limit
    Given there is a limit for "john.doe" (John Doe)
    When I click "Delete" on the limit for "John Doe"
    Then "John Doe" should not be in the limits list
