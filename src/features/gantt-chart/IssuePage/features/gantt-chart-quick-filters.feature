# scope values: "global" | "project:KEY" | "projectIssueType:KEY:Type"
Feature: Gantt Chart - Quick filters

  Quick filters (FR-17): toolbar chips, live search, AND semantics, clear-all, save JQL as chip.

  Background:
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary          | assignee  | priority | resolution | team  |
      | PROJ-101 | Story | subtask  | 2026-03-15 | Done        | done           | 2026-03-25 | Auth service     | john.doe  | High     | Fixed      | Alpha |
      | PROJ-102 | Story | subtask  | 2026-03-20 | In Progress | indeterminate  | 2026-04-10 | Payment module   | jane.doe  | Critical |            | Alpha |
      | PROJ-103 | Bug   | subtask  | 2026-04-01 | To Do       | new            | 2026-04-15 | Fix auth bug     | bob.dev   | Medium   |            | Beta  |
      | PROJ-104 | Task  | subtask  | 2026-04-05 | In Progress | indeterminate  | 2026-04-20 | Setup monitoring | -         | Low      |            | Beta  |
      | PROJ-105 | Story | subtask  | 2026-03-10 | Done        | done           | 2026-03-18 | Docs polish      | jane.doe  | Low      | Done       | Alpha |
    And Gantt settings are configured with:
      | setting             | value                |
      | startMapping        | dateField: created   |
      | endMapping          | dateField: dueDate   |
      | includeSubtasks     | true                 |
      | scope               | global               |

  @SC-GANTT-QF-1
  Scenario: Quick filters row is always visible above the chart with built-in chips
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    Then the Gantt toolbar contains a "Quick filters" row with a search input
    And the quick filters row contains a chip "Unresolved"
    And the quick filters row contains a chip "Hide completed"
    And no chip is active
    And the search input is empty
    And there is no hidden count hint
    And the "Clear quick filters" button is not visible

  @SC-GANTT-QF-2
  Scenario: Built-in "Hide completed" filters out done-status issues
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I click the chip "Hide completed"
    Then the chart shows bars only for "PROJ-102", "PROJ-103", and "PROJ-104"
    And bars for "PROJ-101" and "PROJ-105" are hidden
    And the toolbar shows the hidden count hint "2 hidden by quick filters"
    And the "Clear quick filters" button is visible

  @SC-GANTT-QF-4
  Scenario: Live search filters bars by KEY or summary substring
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I type "auth" into the quick filters search input
    Then the chart shows bars only for "PROJ-101" and "PROJ-103"
    And the toolbar shows the hidden count hint "3 hidden by quick filters"
    When I clear the search input
    Then the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"

  @SC-GANTT-QF-5
  Scenario: Multiple active quick filters combine with AND logic
    Given a custom quick filter exists:
      | name       | mode | jql            |
      | Team Alpha | jql  | team = "Alpha" |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I activate the chips "Unresolved" and "Team Alpha"
    Then the chart shows bars only for "PROJ-102"
    And the bars for "PROJ-101", "PROJ-103", "PROJ-104", and "PROJ-105" are hidden
    And the toolbar shows the hidden count hint "4 hidden by quick filters"

  @SC-GANTT-QF-7
  Scenario: Clear quick filters resets all chips and search
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the chip "Unresolved" is active
    And the search input value is "auth"
    When I click the "Clear quick filters" button
    Then no chip is active
    And the search input is empty
    And the hidden count hint is gone
    And the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"

  @SC-GANTT-QF-15
  Scenario: Save current JQL search as a custom quick filter chip
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search input value is:
      | value           |
      | priority = High |
    And the search mode is "JQL"
    Then the "Save as quick filter" action is available
    When I click the "Save as quick filter" button
    When I edit the name to "High priority" and click "Save" in the save popover
    Then a new chip "High priority" appears in the chips row
    And the chip "High priority" is active
    And the search input is empty
    And the search mode toggle is "Text"
    And the chart shows bars only for "PROJ-101"
    When I reload the Gantt chart
    And the quick filters row contains a chip "High priority"

  @SC-GANTT-QF-3
  Scenario: Active chip and search are session-only after reload
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the chip "Hide completed" is active
    And the search input value is "auth"
    When the page is reloaded and the Gantt chart is displayed again
    Then no chip is active
    And the search input is empty
    And the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"

  @SC-GANTT-QF-11
  Scenario: All bars hidden by quick filters shows an info alert
    Given a custom quick filter exists:
      | name       | mode | jql            |
      | Impossible | jql  | priority = NONE |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I click the chip "Impossible"
    Then the all-hidden quick filter alert is visible
    And the Gantt toolbar contains a "Quick filters" row with a search input

  @SC-GANTT-QF-13
  Scenario: JQL search mode applies JQL and keeps input when switching to Text
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode is "JQL"
    When I type the following into the quick filters search input:
      | value           |
      | priority = High |
    Then the chart shows bars only for "PROJ-101"
    And the toolbar shows the hidden count hint "4 hidden by quick filters"
    When I set the search mode to "Text"
    Then the search input should still contain "priority"
    And I should not see any Gantt bars
    And the toolbar shows the hidden count hint "5 hidden by quick filters"

  @SC-GANTT-QF-6
  Scenario: Search combines with active chips using AND
    Given a custom quick filter exists:
      | name       | mode | jql            |
      | Team Alpha | jql  | team = "Alpha" |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I activate the chip "Team Alpha" and I type "auth" into the quick filters search input
    Then the chart shows bars only for "PROJ-101"

  @SC-GANTT-QF-8
  Scenario: Custom quick filter field mode matches normalized project token
    Given a custom quick filter exists:
      | name           | mode  | fieldId | value |
      | Project = PROJ | field | project | PROJ  |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I click the chip "Project = PROJ"
    Then the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"

  @SC-GANTT-QF-9
  Scenario: Invalid JQL preset shows error in settings and passes all issues when active
    Given a custom quick filter exists with invalid JQL "status === Done":
      | name          | mode | jql             |
      | Broken filter | jql  | status === Done |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    When I open the Gantt settings modal at the "Quick filters" section
    Then the row for "Broken filter" displays a JQL validation error
    When I close the settings modal and activate the chip "Broken filter"
    Then all bars "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105" remain visible
    And no error is thrown in the console

  @SC-GANTT-QF-10
  Scenario: Removing a custom preset from settings removes the chip and prunes active ids
    Given a custom quick filter "Team Alpha" exists and is active
    When I open the Gantt settings modal and remove the "Team Alpha" preset
    And I save and close the modal
    Then the chip "Team Alpha" no longer appears in the toolbar
    And the active filter set no longer includes "Team Alpha"

  @SC-GANTT-QF-14
  Scenario: Invalid JQL in search shows error and does not hide bars
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode is "JQL"
    When I type "((( totally broken" into the quick filters search input
    Then the search input has a red error border
    And a tooltip on the search input shows the parser error message
    And no error is thrown in the console
    And all bars "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105" remain visible
    And there is no "hidden by quick filters" hint

  @SC-GANTT-QF-16
  Scenario: Save as quick filter is hidden when JQL empty or invalid
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode is "JQL"
    Then the "Save as quick filter" button is NOT visible while the input is empty
    When I set the quick filters JQL search to:
      | value       |
      | ((( broken |
    Then the "Save as quick filter" button is NOT visible while the input has a JQL error
    When I set the quick filters JQL search to:
      | value          |
      | team = "Alpha" |
    Then the "Save as quick filter" button becomes visible

  @SC-GANTT-QF-17
  Scenario: Search mode resets to Text after reload
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode toggle is set to "JQL"
    And the search input value is:
      | value          |
      | team = "Alpha" |
    When the page is reloaded and the Gantt chart is displayed again
    Then the search mode toggle is "Text"
    And the search input is empty
    And the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"

  @SC-GANTT-QF-18
  Scenario: Save as quick filter cancel does not add a chip
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode is "JQL"
    And the search input value is:
      | value          |
      | team = "Alpha" |
    When I click "Save as quick filter"
    And I click "Cancel" in the popover
    Then the popover closes
    And no new chip is added
    And the quick filters search matches:
      | value          |
      | team = "Alpha" |
    And the search mode toggle is still "JQL"

  @SC-GANTT-QF-19
  Scenario: Clear quick filters resets search mode to Text
    Given the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"
    And the search mode is "JQL"
    And the search input value is:
      | value           |
      | priority = High |
    And the chip "Unresolved" is active
    When I click the "Clear quick filters" button
    Then no chip is active
    And the search input is empty
    And the search mode toggle is back to "Text"
    And the chart shows bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", and "PROJ-105"
