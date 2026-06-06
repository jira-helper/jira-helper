# scope values: "global" | "project:KEY" | "projectIssueType:KEY:Type"
Feature: Gantt Chart - Errors

  Background:
    Given Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | global             |
    And today is "2026-04-15"

  @SC-GANTT-ERR-1
  Scenario: SC-GANTT-ERR-1 — Error loading subtasks shows ErrorState and retry
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" exists
    And the API request to fetch linked subtasks will fail with error "Network error: unable to reach Jira"
    When the issue view page has loaded
    Then I should see error state with message "Network error: unable to reach Jira"
    And I should see "Retry" button
    And I should not see any Gantt bars

  @SC-GANTT-ERR-2
  Scenario: SC-GANTT-ERR-2 — Retry after fetch failure loads bars
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate    |
      | PROJ-101 | Story | subtask  | 2026-04-01 | Done   | done           | 2026-04-05 |
    And the first fetch of linked subtasks will fail with "Network error" then succeed
    When the issue view page has loaded
    Then I should see "Retry" button
    And I should not see any Gantt bars
    When I click "Retry" button
    Then I should see a bar for "PROJ-101" on the chart

  @SC-GANTT-ERR-3
  Scenario: SC-GANTT-ERR-3 — Retry shows loading while the request is in flight
    Given the issue "PROJ-300" of type "Epic" in project "PROJ" exists
    And the Gantt subtask fetch was configured to succeed after a visible loading delay on retry
    When the issue view page has loaded
    Then I should see error state with message "Request timeout"
    When I click "Retry" button
    Then I should see a loading indicator on the Gantt panel
    And I should not see the Gantt error state

  @SC-GANTT-ERR-4
  Scenario: SC-GANTT-ERR-4 — A second failed retry shows the new error message
    Given the issue "PROJ-400" of type "Epic" in project "PROJ" exists
    And the API will fail the first fetch with "Request timeout" and the second fetch with "Service unavailable"
    When the issue view page has loaded
    Then I should see error state with message "Request timeout"
    When I click "Retry" button
    Then I should see error state with message "Service unavailable"
    And I should see "Retry" button
