Feature: Personal WIP Limit Settings - Edit Limit

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Step format for Then: Then I should see limit: name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  # === BASIC ===

  @SC-EDIT-1
  Scenario: Edit shows current values
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe"
    And the limit field should show value 5
    And the button should show "Update limit"

  @SC-EDIT-2
  Scenario: Update limit value
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 10
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 10 columns "all" swimlanes "all" issueTypes "all"

  @SC-EDIT-3
  Scenario: Replace person on a single-person limit
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I remove person "John Doe" from the selected list
    And I search for "jane" in person name field
    And I select "Jane Doe (jane.doe)" from search results
    And I click "Update limit"
    Then I should see "Jane Doe" in the limits list
    And "John Doe" should not be in the limits list

  # === ADD FILTERS ===

  @SC-EDIT-4
  Scenario: Add swimlane filter to existing simple limit
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe"
    And the limit field should show value 5
    And I see checkbox "All swimlanes" is checked
    And I see checkbox "All columns" is checked
    When I uncheck "All swimlanes"
    And I select only swimlane "Frontend"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "Frontend" issueTypes "all"

  @SC-EDIT-5
  Scenario: Add column filter to limit with swimlane
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "Frontend" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I uncheck "All columns"
    And I select only columns "To Do, In Progress"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "To Do, In Progress" swimlanes "Frontend" issueTypes "all"

  @SC-EDIT-5a
  Scenario: Changing swimlane filter does not affect column filter
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I uncheck "All swimlanes"
    Then I see checkbox "All columns" is checked

  @SC-EDIT-6
  Scenario: Add issue type filter to limit with columns and swimlane
    Given a limit: login "john.doe" name "John Doe" value 5 columns "To Do, In Progress" swimlanes "Frontend" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "To Do, In Progress" swimlanes "Frontend" issueTypes "Task, Bug"

  # === REMOVE FILTERS (EXPAND TO ALL) ===

  @SC-EDIT-7
  Scenario: Expand columns filter to all columns
    Given a limit: login "john.doe" name "John Doe" value 5 columns "To Do, In Progress" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I check "All columns"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  @SC-EDIT-8
  Scenario: Expand swimlanes filter to all swimlanes
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "Frontend" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I check "All swimlanes"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  @SC-EDIT-9
  Scenario: Expand issue types filter to all issue types
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "Task, Bug"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I check "Count all issue types"
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  # === PRESERVE FILTERS ===

  @SC-EDIT-10
  Scenario: Update limit preserves issue type filter
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "Task, Bug"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    Then issue types "Task, Bug" should be selected
    And I see checkbox "Count all issue types" is unchecked

  # === SHOW ALL PERSON ISSUES ===

  @SC-EDIT-13
  Scenario: Disable showAllPersonIssues on existing limit
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And the showAllPersonIssues column for "John Doe" should show "✓"
    And I click "Edit" on the limit for "John Doe"
    And I uncheck "Show all person issues on avatar click"
    And I click "Update limit"
    Then the showAllPersonIssues column for "John Doe" should show "—"

  @SC-EDIT-14
  Scenario: Enable showAllPersonIssues on existing limit
    Given a limit with showAllPersonIssues disabled: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And the showAllPersonIssues column for "John Doe" should show "—"
    And I click "Edit" on the limit for "John Doe"
    And I check "Show all person issues on avatar click"
    And I click "Update limit"
    Then the showAllPersonIssues column for "John Doe" should show "✓"

  # === CANCEL ===

  @SC-EDIT-11
  Scenario: Cancel editing returns to add mode
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 10
    And I click "Cancel"
    Then the button should show "Add limit"
    And I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  # === VALIDATION ===

  @SC-EDIT-12
  Scenario: Zero value is auto-corrected to minimum in edit mode
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 0
    Then the limit field should show value 1
