Feature: Personal WIP Limit Settings - Modal Lifecycle

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Step format for Then: Then I should see limit: name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  @SC-MODAL-1
  Scenario: Open modal with empty state and default form values
    Given there are no limits configured
    When I open the settings modal
    Then I should see the Personal WIP Limits modal
    And I should see an empty limits table
    And I should see the avatar warning message
    And the person name select should be empty
    And the limit field should show value 1
    And I see checkbox "All columns" is checked
    And I see checkbox "All swimlanes" is checked
    And I see checkbox "Count all issue types" is checked
    When I click "Save"
    Then I do not see the modal

  @SC-MODAL-2
  Scenario: Open modal with pre-configured limits
    Given a limit: login "alice" name "Alice Smith" value 3 columns "all" swimlanes "all" issueTypes "all"
    And a limit: login "bob" name "Bob Johnson" value 5 columns "To Do, In Progress" swimlanes "all" issueTypes "all"
    And a limit: login "charlie" name "Charlie Brown" value 2 columns "all" swimlanes "Frontend" issueTypes "all"
    And a limit: login "diana" name "Diana Prince" value 4 columns "all" swimlanes "all" issueTypes "Task, Bug"
    And a limit: login "eve" name "Eve Wilson" value 6 columns "In Progress" swimlanes "Backend" issueTypes "Story"
    When I open the settings modal
    Then I should see the Personal WIP Limits modal
    And I should see 5 limits in the table
    And I should see limit: name "Alice Smith" value 3 columns "all" swimlanes "all" issueTypes "all"
    And I should see limit: name "Bob Johnson" value 5 columns "To Do, In Progress" swimlanes "all" issueTypes "all"
    And I should see limit: name "Charlie Brown" value 2 columns "all" swimlanes "Frontend" issueTypes "all"
    And I should see limit: name "Diana Prince" value 4 columns "all" swimlanes "all" issueTypes "Task, Bug"
    And I should see limit: name "Eve Wilson" value 6 columns "In Progress" swimlanes "Backend" issueTypes "Story"
    When I click "Cancel"
    Then I do not see the modal
