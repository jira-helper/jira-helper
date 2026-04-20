Feature: Gantt Chart - Display

  @SC-GANTT-DISP-1
  Scenario: S2 — View Gantt chart with bars for linked subtasks (happy path)
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation   | created    | status      | statusCategory | dueDate    | summary |
      | PROJ-101 | Story | subtask    | 2026-04-01 | Done        | done           | 2026-04-05 | Alpha   |
      | PROJ-102 | Story | subtask    | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 | Beta    |
      | PROJ-103 | Bug   | subtask    | 2026-04-03 | To Do       | new            | 2026-04-10 | Gamma   |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the issue view page has loaded
    Then I should see the Gantt chart below the issue details block
    And I should see bars for these issues:
      | key      | label | startDate  | endDate    |
      | PROJ-101 | PROJ-101: Alpha | 2026-04-01 | 2026-04-05 |
      | PROJ-102 | PROJ-102: Beta  | 2026-04-02 | 2026-04-08 |
      | PROJ-103 | PROJ-103: Gamma | 2026-04-03 | 2026-04-10 |

  @SC-GANTT-DISP-2
  Scenario: S4 — Task with start date but no end date extends bar to today with warning
    Given the issue "PROJ-200" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-201 | Task | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-202 | Task | subtask  | 2026-04-03 | In Progress | indeterminate  | -          |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And today is "2026-04-11"
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-201" from "2026-04-01" to "2026-04-05"
    And I should see a bar for "PROJ-202" from "2026-04-03" to "2026-04-11"
    And the bar for "PROJ-202" should have a warning icon on the right end
    And the bar for "PROJ-201" should not have a warning icon

  @SC-GANTT-DISP-3
  Scenario: S5 — Issues with neither start nor end shown in collapsible missing-dates section
    Given the issue "PROJ-300" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary          |
      | PROJ-301 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 | Auth service     |
      | PROJ-302 | Story | subtask  | -          | In Progress | indeterminate  | -          | Fix login bug    |
      | PROJ-303 | Bug   | subtask  | -          | To Do       | new            | -          | Update docs      |
      | PROJ-304 | Task  | subtask  | 2026-04-02 | To Do       | new            | -          | Setup monitoring |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-301" on the chart
    And I should see a bar for "PROJ-304" on the chart with a warning icon
    And I should not see a bar for "PROJ-302" on the chart
    And I should not see a bar for "PROJ-303" on the chart
    And I should see collapsible section "2 issues not shown"
    When I expand the collapsible section
    Then I should see these missing issues:
      | key      | summary       | reason                |
      | PROJ-302 | Fix login bug | No start and end date |
      | PROJ-303 | Update docs   | No start and end date |

  @SC-GANTT-DISP-17
  Scenario: FR-16 — Color rules apply to bars (first match wins)
    Given the issue "PROJ-1700" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    | priority |
      | PROJ-1701 | Story | subtask  | 2026-04-01 | In Progress | indeterminate  | 2026-04-10 | Critical |
      | PROJ-1702 | Story | subtask  | 2026-04-02 | Done        | done           | 2026-04-08 | High     |
      | PROJ-1703 | Bug   | subtask  | 2026-04-03 | To Do       | new            | 2026-04-12 | Medium   |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And color rules are configured:
      | mode  | fieldId  | value    | color   |
      | field | priority | Critical | #FF5630 |
      | field | priority | High     | #36B37E |
    When the Gantt chart is rendered
    Then the bar for "PROJ-1701" should have fill color "#FF5630"
    And the bar for "PROJ-1702" should have fill color "#36B37E"
    And the bar for "PROJ-1703" should have default category fill color

  @SC-GANTT-DISP-18
  Scenario: FR-5 — Issue links excluded when includeIssueLinks is false
    Given the issue "PROJ-1800" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation  | created    | status      | statusCategory | dueDate    |
      | PROJ-1801 | Story | subtask   | 2026-04-01 | In Progress | indeterminate  | 2026-04-10 |
      | PROJ-1802 | Task  | issueLink | 2026-04-02 | Done        | done           | 2026-04-08 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-1801" on the chart
    And I should not see a bar for "PROJ-1802" on the chart
