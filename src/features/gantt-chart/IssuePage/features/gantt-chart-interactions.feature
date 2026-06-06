# scope values: "global" | "project:KEY" | "projectIssueType:KEY:Type"
Feature: Gantt Chart - Interactions

  Background:
    Given Gantt settings are configured with:
      | setting             | value                                 |
      | startMapping        | dateField: created                    |
      | endMapping          | dateField: dueDate                    |
      | includeSubtasks     | true                                  |
      | includeEpicChildren | false                                 |
      | includeIssueLinks   | false                                 |
      | tooltipFieldIds     | summary, assignee, status, priority   |
      | scope               | global                                |
    And today is "2026-04-15"

  @SC-GANTT-INT-4
  Scenario: SC-GANTT-INT-4 — Time interval round-trip updates axis tick format
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-101 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-102 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 |
    When the issue view page has loaded
    Then the Gantt time axis should show day-formatted ticks
    And the Gantt time axis interval should be "days"
    When I select the Gantt time interval "hours"
    Then the Gantt time axis should show hour-formatted ticks
    And the Gantt time axis interval should be "hours"
    When I select the Gantt time interval "weeks"
    Then the Gantt time axis should show week-formatted ticks
    And the Gantt time axis interval should be "weeks"
    When I select the Gantt time interval "months"
    Then the Gantt time axis should show month-formatted ticks
    And the Gantt time axis interval should be "months"
    When I select the Gantt time interval "days"
    Then the Gantt time axis should show day-formatted ticks
    And the Gantt time axis interval should be "days"

  @SC-GANTT-INT-5
  Scenario: SC-GANTT-INT-5 — Bar hover shows tooltip with configured fields
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary  | assignee | priority |
      | PROJ-101 | Story | subtask  | 2026-04-01 | In Progress | indeterminate  | 2026-04-10 | My story | john.doe | High     |
    When the Gantt chart is rendered
    When I hover the bar for "PROJ-101"
    Then the Gantt hover tooltip is visible
    And the Gantt tooltip should include field rows:
      | field    | includes        |
      | summary  | My story        |
      | assignee | john            |
      | status   | In Progress     |
      | priority | High            |
    And I should see a bar for "PROJ-101" on the chart

  @SC-GANTT-INT-6
  Scenario: S12 — Hover on bar with no assignee shows dash in tooltip
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary          | assignee | priority |
      | PROJ-104 | Story | subtask  | 2026-04-01 | In Progress | indeterminate  | 2026-04-10 | Setup monitoring | -        | Low      |
    When the Gantt chart is rendered
    When I hover the pointer over the bar for "PROJ-104"
    Then I should see a tooltip with these fields:
      | field    | value            |
      | Summary  | Setup monitoring |
      | Assignee | -                |
      | Status   | In Progress      |
      | Priority | Low              |

  @SC-GANTT-INT-7
  Scenario: Edge — Zoom resets when switching interval from dropdown
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary | assignee | priority |
      | PROJ-101 | Story | subtask  | 2026-03-10 | In Progress | indeterminate  | 2026-03-20 | S1      | a1       | High     |
      | PROJ-102 | Story | subtask  | 2026-03-12 | In Progress | indeterminate  | 2026-03-25 | S2      | a2       | High     |
      | PROJ-103 | Story | subtask  | 2026-03-15 | In Progress | indeterminate  | 2026-03-28 | S3      | a3       | High     |
      | PROJ-104 | Story | subtask  | 2026-03-18 | In Progress | indeterminate  | 2026-04-10 | S4      | a4       | Low      |
    When the Gantt chart is rendered
    And the chart is zoomed in to 200% scale
    When I open the interval dropdown in the toolbar
    And I select interval "Weeks"
    Then the zoom level should reset to 100%
    And the time axis tick labels should include "Week 12", "Week 13", "Week 14"

  @SC-GANTT-INT-8
  Scenario: S13 — Open Gantt in fullscreen modal preserves zoom state
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary | assignee | priority |
      | PROJ-101 | Story | subtask  | 2026-04-01 | In Progress | indeterminate  | 2026-04-08 | S1      | a1       | High     |
      | PROJ-102 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 | S2      | a2       | High     |
      | PROJ-103 | Story | subtask  | 2026-04-03 | In Progress | indeterminate  | 2026-04-08 | S3      | a3       | High     |
      | PROJ-104 | Story | subtask  | 2026-04-04 | In Progress | indeterminate  | 2026-04-08 | S4      | a4       | Low      |
    When the Gantt chart is rendered
    And the chart is displayed at 150% zoom level
    And 4 bars are visible: "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104"
    When I click the "Open in modal" button in the toolbar
    Then a fullscreen modal should be visible
    And the modal should contain the Gantt chart with 4 bars
    And the zoom level in the modal should be 150%
    And the modal should contain the toolbar with zoom controls
    When I press Escape
    Then the fullscreen modal should be closed
    And the inline Gantt chart should be visible with zoom level 150%

  @SC-GANTT-INT-9
  Scenario: Scope picker — default is global when no settings exist
    Given no Gantt settings are stored in localStorage
    And the issue "PROJ-200" of type "Story" in project "PROJ" has no linked issues
    When the issue view page has loaded
    When I click "Open Settings"
    Then the scope picker should show "Global" selected
    And the settings form should show:
      | setting      | value                |
      | startMapping | dateField: created   |
      | endMapping   | dateField: duedate   |

  @SC-GANTT-INT-10
  Scenario: Scope picker — switching scope resets form to that scope’s direct settings
    Given these Gantt settings are stored:
      | scopeKey | startMapping       | endMapping         | includeSubtasks | tooltipFieldIds |
      | _global  | dateField: created | dateField: duedate | true            | summary         |
    And the issue "PROJ-200" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate    |
      | PROJ-201 | Task | subtask  | 2026-04-01 | To Do  | new            | 2026-04-10 |
    When the issue view page has loaded
    When I open the Gantt settings
    Then the scope picker should show "Global" selected
    And the tooltipFieldIds should contain "summary"
    When I switch the scope picker to "Project"
    Then the form should reset to default values
    And the tooltipFieldIds should be empty
    And "Copy from…" should offer "_global" as a source

  @SC-GANTT-INT-11
  Scenario: Scope picker — switching to scope with stored settings loads them
    Given these Gantt settings are stored:
      | scopeKey  | startMapping       | endMapping         | includeSubtasks | tooltipFieldIds |
      | _global   | dateField: created | dateField: duedate | true            | summary         |
      | PROJ      | dateField: created | dateField: duedate | true            | assignee        |
      | OTHER:Bug | dateField: created | dateField: duedate | true            | priority        |
    And the issue "PROJ-200" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate    |
      | PROJ-201 | Task | subtask  | 2026-04-01 | To Do  | new            | 2026-04-10 |
    When the issue view page has loaded
    When I open the Gantt settings
    Then the scope picker shows "Project" selected
    And the tooltipFieldIds should contain "assignee"
    When I switch the scope picker to "Project + issue type"
    Then the form should reset to default values
    And the tooltipFieldIds should be empty
    And "Copy from…" should offer "_global", "PROJ", and "OTHER:Bug" as sources
    When I click "Copy from…" and select "_global"
    Then the tooltipFieldIds should contain "summary"

  @SC-GANTT-INT-12
  Scenario: Scope picker — unsaved changes are discarded on scope switch
    Given these Gantt settings are stored:
      | scopeKey | startMapping       | endMapping         | includeSubtasks | tooltipFieldIds |
      | _global  | dateField: created | dateField: duedate | true            | summary         |
    And the issue "PROJ-200" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate    |
      | PROJ-201 | Task | subtask  | 2026-04-01 | To Do  | new            | 2026-04-10 |
    When the issue view page has loaded
    When I open the Gantt settings
    Then the scope picker should show "Global" selected
    When I modify the tooltipFieldIds to "summary, assignee"
    When I switch the scope picker to "Project"
    Then the form should reset to default values
    When I switch the scope picker to "Global"
    Then the tooltipFieldIds should contain only "summary" (unsaved changes were discarded)

  @SC-GANTT-INT-13
  Scenario: Scope picker — switching away and back reloads saved settings
    Given these Gantt settings are stored:
      | scopeKey | startMapping       | endMapping         | includeSubtasks | tooltipFieldIds |
      | PROJ     | dateField: created | dateField: duedate | true            | assignee        |
    And the issue "PROJ-200" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate    |
      | PROJ-201 | Task | subtask  | 2026-04-01 | To Do  | new            | 2026-04-10 |
    When the issue view page has loaded
    When I open the Gantt settings
    Then the scope picker should show "Project" selected
    And the tooltipFieldIds should contain "assignee"
    When I switch the scope picker to "Project + issue type"
    Then the tooltipFieldIds should be empty
    When I switch the scope picker to "Project"
    Then the tooltipFieldIds should contain "assignee"
