Feature: Gantt Chart - Interactions

  Сценарии zoom, pan, выбора интервала оси времени (hours / days / weeks / months)
  и hover-тултипа по колбаске. Все сценарии с конкретными данными задач.

  Background:
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary          | assignee | priority |
      | PROJ-101 | Story | subtask  | 2026-03-15 | Done        | done           | 2026-03-25 | Auth service     | john.doe | High     |
      | PROJ-102 | Story | subtask  | 2026-03-20 | In Progress | indeterminate  | 2026-04-10 | Payment module   | jane.doe | Critical |
      | PROJ-103 | Bug   | subtask  | 2026-04-01 | To Do       | new            | 2026-04-15 | Fix login bug    | bob.dev  | Medium   |
      | PROJ-104 | Task  | subtask  | 2026-04-05 | In Progress | indeterminate  | 2026-04-20 | Setup monitoring | -        | Low      |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | tooltipFieldIds     | summary, assignee, status, priority |
      | scope               | _global            |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104"

  @SC-GANTT-INT-4
  Scenario: S7 — Interval dropdown switches the time axis granularity
    When I open the interval dropdown in the toolbar
    And I select interval "Hours"
    Then the time axis tick labels should include "09:00", "10:00", "11:00"
    When I select interval "Days"
    Then the time axis tick labels should include "Mar 15", "Mar 16", "Mar 17"
    When I select interval "Weeks"
    Then the time axis tick labels should include "Week 12", "Week 13", "Week 14", "Week 15"
    When I select interval "Months"
    Then the time axis tick labels should include "March", "April"

  @SC-GANTT-INT-5
  Scenario: S12 — Hover on bar shows tooltip with configured fields
    When I hover the pointer over the bar for "PROJ-102"
    Then I should see a tooltip with these fields:
      | field    | value          |
      | Summary  | Payment module |
      | Assignee | jane.doe       |
      | Status   | In Progress    |
      | Priority | Critical       |
    When I move the pointer away from the bar
    Then the tooltip should disappear

  @SC-GANTT-INT-6
  Scenario: S12 — Hover on bar with no assignee shows dash in tooltip
    When I hover the pointer over the bar for "PROJ-104"
    Then I should see a tooltip with these fields:
      | field    | value            |
      | Summary  | Setup monitoring |
      | Assignee | -                |
      | Status   | In Progress      |
      | Priority | Low              |

  @SC-GANTT-INT-7
  Scenario: Edge — Zoom resets when switching interval from dropdown
    Given the chart is zoomed in to 200% scale
    When I open the interval dropdown in the toolbar
    And I select interval "Weeks"
    Then the zoom level should reset to 100%
    And the time axis tick labels should include "Week 12", "Week 13", "Week 14"

  @SC-GANTT-INT-8
  Scenario: S13 — Open Gantt in fullscreen modal preserves zoom state
    Given the chart is displayed at 150% zoom level
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
    And the issue "PROJ-200" of type "Story" in project "PROJ" is open
    When I open the Gantt settings
    Then the scope picker should show "Global" selected
    And the form should show default values (startMapping: dateField/created, endMapping: dateField/duedate)

  @SC-GANTT-INT-10
  Scenario: Scope picker — switching scope resets form to that scope's direct settings
    Given these Gantt settings are stored:
      | scopeKey | tooltipFieldIds |
      | _global  | summary         |
    And the issue "PROJ-200" of type "Story" in project "PROJ" is open
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
      | scopeKey    | tooltipFieldIds   |
      | _global     | summary           |
      | PROJ        | assignee          |
      | OTHER:Bug   | priority          |
    And the issue "PROJ-200" of type "Story" in project "PROJ" is open
    When I open the Gantt settings
    And the scope picker shows "Project" selected
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
      | scopeKey | tooltipFieldIds |
      | _global  | summary         |
    And the issue "PROJ-200" of type "Story" in project "PROJ" is open
    When I open the Gantt settings
    And the scope picker shows "Global" selected
    And I modify the tooltipFieldIds to "summary, assignee"
    When I switch the scope picker to "Project"
    Then the form should reset to default values
    When I switch the scope picker back to "Global"
    Then the tooltipFieldIds should contain only "summary" (unsaved changes were discarded)

  @SC-GANTT-INT-13
  Scenario: Scope picker — switching away and back reloads saved settings
    Given these Gantt settings are stored:
      | scopeKey | tooltipFieldIds |
      | PROJ     | assignee        |
    And the issue "PROJ-200" of type "Story" in project "PROJ" is open
    When I open the Gantt settings
    Then the scope picker should show "Project" selected
    And the tooltipFieldIds should contain "assignee"
    When I switch the scope picker to "Project + issue type"
    Then the tooltipFieldIds should be empty
    When I switch the scope picker back to "Project"
    Then the tooltipFieldIds should contain "assignee"
