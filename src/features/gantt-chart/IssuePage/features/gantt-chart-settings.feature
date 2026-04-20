Feature: Gantt Chart - Settings

  @SC-GANTT-SET-1
  Scenario: S1 — First open without saved settings shows first-run state
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate    |
      | PROJ-101 | Story | subtask  | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-102 | Bug   | subtask  | 2026-04-02 | To Do  | new            | 2026-04-08 |
    And no Gantt settings exist in storage
    When the issue view page has loaded
    Then I should see first-run message "Gantt chart is not configured yet. Please configure start and end date mappings."
    And I should see "Open Settings" button
    And I should not see any Gantt bars
    When I click "Open Settings"
    Then I should see the Gantt settings dialog

  @SC-GANTT-SET-4
  Scenario: S11 — Create project+issueType scope with Copy from Global
    Given these Gantt scopes exist in storage:
      | scope   | startMapping       | endMapping             | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global | dateField: created | statusTransition: Done | true            | false               | false             |
    And the issue "PROJA-50" of type "Story" in project "PROJA" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate |
      | PROJA-51 | Task | subtask  | 2026-04-01 | Done   | done           | -       |
    And the changelog for "PROJA-51" contains these status transitions:
      | timestamp           | fromStatus  | toStatus | fromCategory  | toCategory    |
      | 2026-04-03T15:00:00 | In Progress | Done     | indeterminate | done          |
    And I opened issue view for issue "PROJA-50" of type "Story" in project "PROJA"
    When I open Gantt settings from the gear button
    And I select scope "Project + issue type"
    And I click "Copy from…"
    And I choose to copy from "Global"
    And I confirm copy
    Then the settings form should show:
      | setting      | value                      |
      | startMapping | dateField: created         |
      | endMapping   | statusTransition: Done     |
    When I change start mapping to "Date field" with field "startDate"
    And I click "Save"
    Then localStorage key "jh-gantt-settings" should contain scope "PROJA:Story" with:
      | setting      | value                      |
      | startMapping | dateField: startDate       |
      | endMapping   | statusTransition: Done     |
    And localStorage key "jh-gantt-settings" should still contain scope "_global" with:
      | setting      | value                      |
      | startMapping | dateField: created         |
      | endMapping   | statusTransition: Done     |
