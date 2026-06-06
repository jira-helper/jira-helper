Feature: Personal WIP Limit Settings - Add Limit

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Step format for Then: Then I should see limit: name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  # === BASIC ===

  @SC-ADD-1
  Scenario: Add a new limit for a person
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    And the form should be reset to default values

  # === COLUMN FILTERING ===

  @SC-ADD-2
  Scenario: Add a limit for specific columns only
    When I open the settings modal
    And I search for "jane" in person name field
    And I select "Jane Doe (jane.doe)" from search results
    And I set the limit to 3
    And I uncheck "All columns"
    And I select only columns "To Do, In Progress"
    And I click "Add limit"
    Then I should see limit: name "Jane Doe" value 3 columns "To Do, In Progress" swimlanes "all" issueTypes "all"

  # === SWIMLANE FILTERING ===

  @SC-ADD-3
  Scenario: Add a limit for specific swimlanes only
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I uncheck "All swimlanes"
    And I select only swimlane "Frontend"
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "Frontend" issueTypes "all"

  # === ISSUE TYPE FILTERING ===

  @SC-ADD-4
  Scenario: Add a limit for specific issue types only
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 3 columns "all" swimlanes "all" issueTypes "Task, Bug"
    And the form should be reset to default values

  # === COMBINED FILTERS ===

  @SC-ADD-5
  Scenario: Add a limit with columns, swimlanes and issue types
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 4
    And I uncheck "All columns"
    And I select only columns "In Progress"
    And I uncheck "All swimlanes"
    And I select only swimlane "Backend"
    And I uncheck "Count all issue types"
    And I select issue types "Story"
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 4 columns "In Progress" swimlanes "Backend" issueTypes "Story"

  @SC-ADD-6
  Scenario: Add multiple limits for same person with different columns
    Given a limit: login "john.doe" name "John Doe" value 3 columns "To Do" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I uncheck "All columns"
    And I select only columns "In Progress"
    And I click "Add limit"
    Then I should see 2 limits in the table

  # === VALIDATION ===

  @SC-ADD-7
  Scenario: Cannot add limit without selecting a person
    When I open the settings modal
    And I set the limit to 5
    And I click "Add limit"
    Then I should see validation error "Select at least one person"
    And the person name field should have error highlight
    And I should see an empty limits table

  @SC-ADD-8
  Scenario: Cannot add limit with zero value
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 0
    Then the limit field should show value 1

  @SC-ADD-9
  Scenario: Cannot add duplicate limit
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I click "Add limit"
    Then I should see validation error for duplicate limit
    And I should see 1 limit in the table
    And I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  @SC-ADD-9a
  Scenario: Cannot add duplicate limit with same issue types
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "Task, Bug"
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then I should see validation error for duplicate limit
    And I should see 1 limit in the table

  # === SHOW ALL PERSON ISSUES ===

  @SC-ADD-11
  Scenario: Add limit with showAllPersonIssues disabled
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I uncheck "Show all person issues on avatar click"
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    And the showAllPersonIssues column for "John Doe" should show "—"

  @SC-ADD-12
  Scenario: Add limit with showAllPersonIssues enabled (default)
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 3 columns "all" swimlanes "all" issueTypes "all"
    And the showAllPersonIssues column for "John Doe" should show "✓"

  # === MULTI-PERSON ===

  @SC-ADD-13
  Scenario: Add a single limit covering multiple persons
    When I open the settings modal
    And I search for "alice" in person name field
    And I select "Alice (alice)" from search results
    And I search for "bob" in person name field
    And I select "Bob (bob)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then the limits table row should list persons "Alice, Bob"
    And I should see 1 limit in the table

  @SC-ADD-14
  Scenario: Person search input clears after picking a user
    When I open the settings modal
    And I search for "alice" in person name field
    And I select "Alice (alice)" from search results
    Then the person search input should be empty

  @SC-ADD-15
  Scenario: Shared limit checkbox is hidden until 2+ persons are selected
    When I open the settings modal
    Then the shared limit checkbox should not be visible
    When I search for "alice" in person name field
    And I select "Alice (alice)" from search results
    Then the shared limit checkbox should not be visible
    When I search for "bob" in person name field
    And I select "Bob (bob)" from search results
    Then the shared limit checkbox should be visible

  @SC-ADD-16
  Scenario: Add a shared limit and see "(shared)" suffix in the table
    When I open the settings modal
    And I search for "alice" in person name field
    And I select "Alice (alice)" from search results
    And I search for "bob" in person name field
    And I select "Bob (bob)" from search results
    And I set the limit to 5
    And I check the shared limit checkbox
    And I click "Add limit"
    Then the limit cell of the first row should show "5 (shared)"

  @SC-ADD-10
  Scenario: Validation error clears when switching to edit mode
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 3
    And I click "Add limit"
    Then I should see validation error for duplicate limit
    When I click "Edit" on the limit for "John Doe"
    Then the person name field should not have error highlight
