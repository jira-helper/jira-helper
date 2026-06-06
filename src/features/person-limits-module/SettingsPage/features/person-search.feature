Feature: Personal WIP Limit Settings - Person Search

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  @SC-SEARCH-1
  Scenario: Search shows matching users with avatars
    When I open the settings modal
    And I search for "john" in person name field
    Then I should see a dropdown with matching users
    And each search result should show avatar, display name and login

  @SC-SEARCH-2
  Scenario: Search requires minimum 2 characters
    When I open the settings modal
    And I search for "j" in person name field
    Then I should not see search results dropdown
    When I search for "jo" in person name field
    Then I should see search results dropdown

  @SC-SEARCH-3
  Scenario: No users found
    Given search returns no users
    When I open the settings modal
    And I search for "zzzznonexistent" in person name field
    Then I should see "No users found" in the dropdown

  @SC-SEARCH-4
  Scenario: API error during search
    Given search API fails
    When I open the settings modal
    And I search for "john" in person name field
    Then I should see "Search failed, try again" in the dropdown

  @SC-SEARCH-5
  Scenario: Select user from search results
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    Then the person select should show "John Doe"

  @SC-SEARCH-6
  Scenario: Edit mode shows current person in select
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    Then the person select should show "John Doe"
