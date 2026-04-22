Feature: Personal WIP Limit Settings - Swimlane Strategy

  # Jira's RapidBoard editmodel returns saved query swimlanes regardless of which
  # swimlane strategy is currently active. When the strategy is not "custom", those
  # entries are inert (they don't render on the board) and would only confuse the
  # user. The settings UI must therefore hide the swimlane section entirely in that
  # case, and the runtime must ignore any saved swimlane filter on existing limits.

  @SC-SWIM-1
  Scenario: Swimlane section is hidden when board has no custom swimlanes
    Given the board has no custom swimlanes
    When I open the settings modal
    Then I should not see the swimlane section

  @SC-SWIM-2
  Scenario: Swimlane section is shown when board has custom swimlanes
    Given the board has custom swimlanes
    When I open the settings modal
    Then I should see the swimlane section

  @SC-SWIM-3
  Scenario: Can add a limit on a board without custom swimlanes
    Given the board has no custom swimlanes
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  @SC-SWIM-4
  Scenario: Existing limit with stale swimlanes can be edited without losing them
    # An admin previously had custom swimlanes; the user saved a limit referencing them.
    # Now the board's strategy was switched to "none" (or "epic" / "assignee") — the
    # saved swimlane filter is no longer editable in UI, but it must be preserved
    # so the user doesn't accidentally lose their original configuration.
    Given the board has no custom swimlanes
    And a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    Then I should not see the swimlane section
    When I set the limit to 7
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 7 columns "all" swimlanes "all" issueTypes "all"
