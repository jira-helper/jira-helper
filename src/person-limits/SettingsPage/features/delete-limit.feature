Feature: Personal WIP Limit Settings - Delete

  # Step format: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  @SC-DELETE-1
  Scenario: Delete a limit
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "John Doe"
    Then "John Doe" should not be in the limits list

  @SC-DELETE-2
  Scenario: Delete the only limit leads to empty table
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "John Doe"
    Then I should see an empty limits table

  @SC-DELETE-3
  Scenario: Delete one of two limits for the same person
    Given a limit: login "john.doe" name "John Doe" value 3 columns "To Do" swimlanes "all" issueTypes "all"
    And a limit: login "john.doe" name "John Doe" value 5 columns "In Progress" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Delete" on the first limit for "John Doe"
    Then I should see 1 limit in the table
    And I should see limit: name "John Doe" value 5 columns "In Progress" swimlanes "all" issueTypes "all"

  @SC-DELETE-4
  Scenario: Deleted limit reappears after cancel and reopen
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    And a limit: login "jane.doe" name "Jane Doe" value 3 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "John Doe"
    And I click "Cancel"
    And I click "Manage per-person WIP-limits"
    Then I should see 2 limits in the table
    And I should see "John Doe" in the limits list
    And I should see "Jane Doe" in the limits list
