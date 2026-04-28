Feature: Progress Status Mapping - Jira Status Autocomplete

  Scenarios for selecting Jira statuses in the shared status progress mapping editor.
  The editor stores Jira status ids as stable keys, uses current Jira status names as labels,
  and keeps saved names only as fallback/debug metadata.

  @SC-PSM-AUTO-1
  Scenario: Select Jira status from autocomplete saves status id
    Given Jira statuses are available:
      | id    | name              | statusCategory |
      | 10000 | To Do             | new            |
      | 10001 | Ready for Release | indeterminate  |
      | 10002 | Done              | done           |
    When I open status progress mapping settings
    And I add a status progress mapping row
    And I search Jira status field for "Ready"
    And I select Jira status "Ready for Release" with id "10001"
    And I select progress bucket "Done"
    Then the status progress mapping row should show Jira status "Ready for Release"
    And the saved status progress mapping should contain:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |

  @SC-PSM-AUTO-2
  Scenario: Autocomplete does not save arbitrary status text
    Given Jira statuses are available:
      | id    | name        | statusCategory |
      | 10000 | To Do       | new            |
      | 10002 | Done        | done           |
    When I open status progress mapping settings
    And I add a status progress mapping row
    And I search Jira status field for "Ready for Release"
    Then I should see no Jira status option "Ready for Release"
    And I should see "Select Jira status from the list"
    When I select progress bucket "Done"
    And I save status progress mapping settings
    Then the status progress mapping should not be saved for text "Ready for Release"

  @SC-PSM-AUTO-3
  Scenario: Current label comes from Jira statuses instead of saved fallback name
    Given the saved status progress mapping contains:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |
    And Jira statuses are available:
      | id    | name     | statusCategory |
      | 10001 | Released | done           |
    When I open status progress mapping settings
    Then the status progress mapping row for status id "10001" should show Jira status "Released"
    And the row should keep fallback status name "Ready for Release" only as debug metadata

  @SC-PSM-AUTO-4
  Scenario: Missing Jira status shows fallback label but matching remains id-only
    Given the saved status progress mapping contains:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |
    And Jira statuses are not loaded yet
    When I open status progress mapping settings
    Then the status progress mapping row for status id "10001" should show fallback Jira status "Ready for Release"
    When Jira statuses are available:
      | id    | name        | statusCategory |
      | 10000 | To Do       | new            |
      | 10002 | Done        | done           |
    Then the status progress mapping row for status id "10001" should still show fallback Jira status "Ready for Release"
    And progress matching should use only status id "10001"
    And progress matching should not use fallback status name "Ready for Release"
