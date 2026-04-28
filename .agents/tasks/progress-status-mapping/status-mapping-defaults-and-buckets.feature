Feature: Progress Status Mapping - Defaults And Buckets

  Scenarios for default Jira statusCategory behavior and allowed progress buckets.
  Missing mapping settings keep existing Jira defaults, while custom mapping remains limited
  to To Do, In Progress and Done.

  @SC-PSM-DEFAULT-1
  Scenario: Missing settings block uses default Jira statusCategory mapping
    Given no status progress mapping block exists
    And Jira statuses are available:
      | id    | name        | statusCategory |
      | 10000 | To Do       | new            |
      | 10001 | In Progress | indeterminate  |
      | 10002 | Done        | done           |
    When progress buckets are resolved for Jira statuses
    Then Jira status id "10000" should resolve to progress bucket "To Do"
    And Jira status id "10001" should resolve to progress bucket "In Progress"
    And Jira status id "10002" should resolve to progress bucket "Done"

  @SC-PSM-DEFAULT-2
  Scenario: Custom mapping offers only three progress buckets
    Given Jira statuses are available:
      | id    | name              | statusCategory |
      | 10001 | Ready for Release | indeterminate  |
    When I open status progress mapping settings
    And I add a status progress mapping row
    And I open the progress bucket dropdown
    Then I should see progress bucket option "To Do"
    And I should see progress bucket option "In Progress"
    And I should see progress bucket option "Done"
    And I should not see progress bucket option "Blocked"
    And I should not see an option to create a custom progress segment

  @SC-PSM-DEFAULT-3
  Scenario: Blocked remains outside custom status mapping
    Given Jira statuses are available:
      | id    | name    | statusCategory |
      | 10003 | Blocked | indeterminate  |
    When I open status progress mapping settings
    And I add a status progress mapping row
    And I select Jira status "Blocked" with id "10003"
    Then I can map status id "10003" only to these progress buckets:
      | bucket      |
      | To Do       |
      | In Progress |
      | Done        |
    And I should not be able to save progress bucket "Blocked"
