Feature: Gantt Chart - Errors and Resilience

  Сценарии ошибки загрузки связанных задач: отображение ErrorState,
  повторная попытка (retry), успешная загрузка после retry.
  Все сценарии с конкретными данными и состояниями.

  @SC-GANTT-ERR-1
  Scenario: S10 — Failed load of linked issues shows error state with retry
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
    And I should see a "Retry" button
    And I should not see any Gantt bars

  @SC-GANTT-ERR-2
  Scenario: S10 — Retry after error loads the chart successfully
    Given the issue "PROJ-200" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate    |
      | PROJ-201 | Story | subtask  | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-202 | Bug   | subtask  | 2026-04-02 | To Do  | new            | 2026-04-08 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the previous load attempt failed and error state is visible with message "Request timeout"
    When the API request to fetch linked subtasks will succeed on next attempt
    And I click "Retry"
    Then the error state should disappear
    And I should see bars for these issues:
      | key      | startDate  | endDate    |
      | PROJ-201 | 2026-04-01 | 2026-04-05 |
      | PROJ-202 | 2026-04-02 | 2026-04-08 |

  @SC-GANTT-ERR-3
  Scenario: Edge — Retry shows loading indicator while request is in progress
    Given the issue "PROJ-300" of type "Epic" in project "PROJ" exists
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the previous load attempt failed and error state is visible
    When I click "Retry"
    Then I should see a loading indicator
    And I should not see the error state
    And I should not see any Gantt bars

  @SC-GANTT-ERR-4
  Scenario: Edge — Retry fails again shows updated error state
    Given the issue "PROJ-400" of type "Epic" in project "PROJ" exists
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the previous load attempt failed and error state is visible with message "Request timeout"
    And the API request to fetch linked subtasks will fail with error "Service unavailable"
    When I click "Retry"
    Then I should see error state with message "Service unavailable"
    And I should see a "Retry" button
