Feature: Gantt Chart - Quick Filters (FR-17)

  Quick filters позволяют ad-hoc сужать видимые задачи без пересохранения настроек.
  Активное состояние chips и search — session-only; пресеты — персистентны и каскадируются.
  Множественные активные chips объединяются логикой AND (как в Jira boards).

  Background:
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    | summary          | assignee  | priority | resolution | team   |
      | PROJ-101 | Story | subtask  | 2026-03-15 | Done        | done           | 2026-03-25 | Auth service     | john.doe  | High     | Fixed      | Alpha  |
      | PROJ-102 | Story | subtask  | 2026-03-20 | In Progress | indeterminate  | 2026-04-10 | Payment module   | jane.doe  | Critical |            | Alpha  |
      | PROJ-103 | Bug   | subtask  | 2026-04-01 | To Do       | new            | 2026-04-15 | Fix auth bug     | bob.dev   | Medium   |            | Beta   |
      | PROJ-104 | Task  | subtask  | 2026-04-05 | In Progress | indeterminate  | 2026-04-20 | Setup monitoring | -         | Low      |            | Beta   |
      | PROJ-105 | Story | subtask  | 2026-03-10 | Done        | done           | 2026-03-18 | Docs polish      | jane.doe  | Low      | Done       | Alpha  |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | scope               | _global            |
    And the Gantt chart is displayed with bars for "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105"

  @SC-GANTT-QF-1
  Scenario: Quick filters row is always visible above the chart with built-in chips
    Then the Gantt toolbar contains a "Quick filters" row with a search input
    And the row contains a chip "Unresolved"
    And the row contains a chip "Hide completed"
    And no chip is active by default
    And the search input is empty
    And there is no "hidden by quick filters" hint
    And there is no "Clear quick filters" button

  @SC-GANTT-QF-2
  Scenario: Built-in "Hide completed" replaces the legacy hideCompletedTasks setting
    When I click the chip "Hide completed"
    Then the Gantt chart shows bars only for "PROJ-102", "PROJ-103", "PROJ-104"
    And bars for "PROJ-101" and "PROJ-105" are hidden
    And the toolbar shows the hint "2 hidden by quick filters"
    And a "Clear quick filters" button becomes visible

  @SC-GANTT-QF-3
  Scenario: Active state of chips and search is session-only
    Given I clicked the chip "Hide completed"
    And the search input value is "auth"
    When the page is reloaded and the Gantt chart is displayed again
    Then no chip is active
    And the search input is empty
    And all bars "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105" are visible

  @SC-GANTT-QF-4
  Scenario: Live search filters bars by KEY or summary substring (case-insensitive)
    When I type "auth" into the quick filters search input
    Then the chart shows bars only for "PROJ-101" (label "PROJ-101: Auth service") and "PROJ-103" (label "PROJ-103: Fix auth bug")
    And the toolbar shows the hint "3 hidden by quick filters"
    When I clear the search input
    Then all bars "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105" are visible

  @SC-GANTT-QF-5
  Scenario: Multiple active quick filters combine with AND logic
    Given a custom quick filter exists:
      | name        | mode | jql           |
      | Team Alpha  | jql  | team = "Alpha" |
    When I activate chips "Unresolved" and "Team Alpha"
    Then the chart shows bars only for "PROJ-102"
    And bars for "PROJ-101", "PROJ-103", "PROJ-104", "PROJ-105" are hidden
    And the toolbar shows the hint "4 hidden by quick filters"

  @SC-GANTT-QF-6
  Scenario: Search combines with active chips using AND
    Given a custom quick filter exists:
      | name        | mode | jql           |
      | Team Alpha  | jql  | team = "Alpha" |
    When I activate the chip "Team Alpha"
    And I type "auth" into the quick filters search input
    Then the chart shows bars only for "PROJ-101" (Alpha + matches "auth" in summary)

  @SC-GANTT-QF-7
  Scenario: Clear quick filters resets all chips and search at once
    Given the chip "Unresolved" is active
    And the search input value is "auth"
    When I click the "Clear quick filters" button
    Then no chip is active
    And the search input is empty
    And the "hidden by quick filters" hint disappears
    And all bars are visible

  @SC-GANTT-QF-8
  Scenario: Custom quick filter (field mode) compares against any normalized field token
    Given a custom quick filter exists:
      | name             | mode  | fieldId  | value |
      | Project = PROJ   | field | project  | PROJ  |
    When I activate the chip "Project = PROJ"
    Then the chart shows bars for all issues whose project key is "PROJ"
    # The matcher checks key, name, id, value, displayName, emailAddress tokens of the field value.

  @SC-GANTT-QF-9
  Scenario: Custom quick filter with invalid JQL gracefully passes all issues
    Given a custom quick filter exists with invalid JQL "status === Done":
      | name           | mode | jql               |
      | Broken filter  | jql  | status === Done    |
    When I open the Gantt settings modal at the "Quick filters" section
    Then the row for "Broken filter" displays a JQL validation error
    When I close the settings modal and activate the chip "Broken filter"
    Then all bars remain visible (graceful fallback — invalid JQL passes everything)
    And no error is thrown in the console

  @SC-GANTT-QF-10
  Scenario: Removing a custom quick filter from settings deactivates it automatically
    Given a custom quick filter "Team Alpha" exists and is active
    When I open the Gantt settings modal and remove the "Team Alpha" preset
    And I save and close the modal
    Then the chip "Team Alpha" no longer appears in the toolbar
    And the active filter set no longer includes "Team Alpha" (pruned by id)

  @SC-GANTT-QF-11
  Scenario: All bars hidden by quick filters shows an info alert
    Given a custom quick filter exists:
      | name        | mode | jql              |
      | Impossible  | jql  | priority = NONE  |
    When I activate the chip "Impossible"
    Then the chart area shows the alert "All tasks are hidden by quick filters"
    And the toolbar still shows chips and the search input so the user can recover

  @SC-GANTT-QF-12
  Scenario: Quick filters cascade like other scope settings
    Given the global scope has a custom quick filter "Global filter"
    And the project "PROJ" scope has a custom quick filter "Project filter" (no inheritance from global — each scope owns its full quickFilters list)
    When I open an issue in project "PROJ"
    Then the toolbar chips include built-ins, then "Project filter"
    And do NOT include "Global filter" (project-level overrides global)

  @SC-GANTT-QF-13
  Scenario: Search supports JQL mode with custom-field resolution
    Given the search mode toggle "[Text|JQL]" is shown to the left of the search input
    And the toggle is set to "Text" by default
    When I switch the search mode toggle to "JQL"
    And I type "priority = High" into the quick filters search input
    Then the chart shows bars only for "PROJ-101" (Priority = High)
    And the toolbar shows the hint "4 hidden by quick filters"
    And the search input retains the value "priority = High" after the switch
    When I switch the toggle back to "Text"
    Then the search input still contains "priority = High"
    And the chart shows no bars (no label contains the substring "priority = High")
    And the toolbar shows the hint "5 hidden by quick filters"

  @SC-GANTT-QF-14
  Scenario: Invalid JQL in search shows error and gracefully passes everything
    Given the search mode is "JQL"
    When I type "((( totally broken" into the quick filters search input
    Then the search input has a red error border
    And a tooltip on the search input shows the parser error message
    And no error is thrown in the console
    And all bars "PROJ-101", "PROJ-102", "PROJ-103", "PROJ-104", "PROJ-105" remain visible
    And there is no "hidden by quick filters" hint

  @SC-GANTT-QF-15
  Scenario: Save current JQL search as a custom quick filter chip
    Given the search mode is "JQL"
    And the search input value is "team = \"Alpha\""
    Then a "Save as quick filter" button is visible next to the search input
    When I click "Save as quick filter"
    Then an inline popover opens with a name input prefilled with "team = \"Alpha\""
    And the popover has "Save" and "Cancel" buttons
    When I edit the name to "Alpha team" and click "Save"
    Then a new chip "Alpha team" appears in the chips row (after built-ins)
    And the chip "Alpha team" is active
    And the search input is empty
    And the search mode toggle is back to "Text"
    And the chart shows bars only for "PROJ-101", "PROJ-102", "PROJ-105"
    And the new "Alpha team" preset is persisted into the current scope's quickFilters in localStorage

  @SC-GANTT-QF-16
  Scenario: Save button is hidden when JQL is empty or invalid
    Given the search mode is "JQL"
    Then the "Save as quick filter" button is NOT visible while the input is empty
    When I type "((( broken" into the input
    Then the "Save as quick filter" button is NOT visible while the input has a JQL error
    When I clear the input and type "team = \"Alpha\""
    Then the "Save as quick filter" button becomes visible

  @SC-GANTT-QF-17
  Scenario: Search mode is session-only (resets to Text on reload)
    Given the search mode toggle is set to "JQL"
    And the search input value is "team = \"Alpha\""
    When the page is reloaded and the Gantt chart is displayed again
    Then the search mode toggle is "Text"
    And the search input is empty
    And all bars are visible

  @SC-GANTT-QF-18
  Scenario: Save as quick filter cancellation does not persist anything
    Given the search mode is "JQL"
    And the search input value is "team = \"Alpha\""
    When I click "Save as quick filter"
    And I click "Cancel" in the popover
    Then the popover closes
    And no new chip is added
    And the search input still contains "team = \"Alpha\""
    And the search mode toggle is still "JQL"

  @SC-GANTT-QF-19
  Scenario: Clear quick filters resets the search mode along with chips and search
    Given the search mode is "JQL"
    And the search input value is "priority = High"
    And the chip "Unresolved" is active
    When I click the "Clear quick filters" button
    Then no chip is active
    And the search input is empty
    And the search mode toggle is back to "Text"
    And all bars are visible
