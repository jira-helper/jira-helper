Feature: Gantt Chart - Errors

  @SC-GANTT-ERR-1
  Scenario: SC-GANTT-ERR-1 — Error loading subtasks shows ErrorState and retry
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" exists
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the API request to fetch linked subtasks will fail with error "Network error: unable to reach Jira"
    When the issue view page has loaded
    Then I should see error state with message "Network error: unable to reach Jira"
    And I see "Retry" button
    And I should not see any Gantt bars
