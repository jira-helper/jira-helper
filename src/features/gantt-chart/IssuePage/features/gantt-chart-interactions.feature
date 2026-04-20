Feature: Gantt Chart - Interactions

  @SC-GANTT-INT-5
  Scenario: SC-GANTT-INT-5 — Interval change (days → hours) updates axis tick format
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-101 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-102 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the issue view page has loaded
    Then the Gantt time axis should show day-formatted ticks
    When I select the Gantt time interval "hours"
    Then the Gantt time axis should show hour-formatted ticks
