Feature: Gantt Chart - Display

  Сценарии отображения Gantt-диаграммы на странице задачи (issue view):
  happy path с конкретными задачами, обработка задач без дат, разбивка
  по статусам из changelog, фильтрация по типу связи (FR-5),
  пустое состояние, производительность при 50+ задачах.

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
    Then I should see a collapsible "Gantt Chart" section after #attachmentmodule
    And I should see bars for these issues:
      | key      | label           | startDate  | endDate    |
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

  @SC-GANTT-DISP-4
  Scenario: S6 — Status breakdown toggle redraws bars with colored sections from changelog
    Given the issue "PROJ-400" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-401 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-07 |
      | PROJ-402 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-09 |
    And the changelog for "PROJ-401" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-01T09:00:00 | -           | To Do       | -             | new           |
      | 2026-04-02T10:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-05T14:00:00 | In Progress | Done        | indeterminate | done          |
    And the changelog for "PROJ-402" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-02T09:00:00 | -           | To Do       | -             | new           |
      | 2026-04-04T11:00:00 | To Do       | In Progress | new           | indeterminate |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the Gantt chart is showing simple solid bars
    When I turn on the "Status breakdown" toggle in the Gantt toolbar
    Then the bar for "PROJ-401" should show these status sections:
      | statusName  | category   | color | from                | to                  |
      | To Do       | todo       | gray  | 2026-04-01T00:00:00 | 2026-04-02T10:00:00 |
      | In Progress | inProgress | blue  | 2026-04-02T10:00:00 | 2026-04-05T14:00:00 |
      | Done        | done       | green | 2026-04-05T14:00:00 | 2026-04-07T00:00:00 |
    And the bar for "PROJ-402" should show these status sections:
      | statusName  | category   | color | from                | to                  |
      | To Do       | todo       | gray  | 2026-04-02T00:00:00 | 2026-04-04T11:00:00 |
      | In Progress | inProgress | blue  | 2026-04-04T11:00:00 | 2026-04-09T00:00:00 |

  @SC-GANTT-DISP-5
  Scenario: S9 — No linked issues shows empty state
    Given the issue "PROJ-500" of type "Story" in project "PROJ" has no linked issues
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | true               |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the issue view page has loaded
    Then I should see empty state message "Нет связанных задач для отображения диаграммы"
    And I should see an "Open Settings" button
    And I should not see any Gantt bars

  @SC-GANTT-DISP-6
  Scenario: FR-5 — Include subtasks and epic children but not issue links
    Given the issue "PROJ-600" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation        | created    | status      | statusCategory | dueDate    |
      | PROJ-601 | Story | subtask         | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-602 | Story | epic-child      | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 |
      | PROJ-603 | Bug   | blocks (inward) | 2026-04-03 | To Do       | new            | 2026-04-10 |
      | PROJ-604 | Task  | is cloned by (inward) | 2026-04-04 | Done  | done           | 2026-04-09 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | true               |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see bars for these issues:
      | key      |
      | PROJ-601 |
      | PROJ-602 |
    And I should not see a bar for "PROJ-603" on the chart
    And I should not see a bar for "PROJ-604" on the chart

  @SC-GANTT-DISP-7
  Scenario: FR-5 — Include only specific link types filters out non-matching links
    Given the issue "PROJ-700" of type "Story" in project "PROJ" has these linked issues:
      | key      | type  | relation              | created    | status      | statusCategory | dueDate    |
      | PROJ-701 | Task  | subtask               | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-702 | Bug   | blocks (inward)       | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 |
      | PROJ-703 | Story | is cloned by (inward) | 2026-04-03 | To Do       | new            | 2026-04-10 |
      | PROJ-704 | Task  | relates to (outward)  | 2026-04-04 | Done        | done           | 2026-04-09 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | true               |
      | scope               | _global            |
    And issue link type inclusion is configured as:
      | linkType | direction |
      | blocks   | inward    |
    When the Gantt chart is rendered
    Then I should see bars for these issues:
      | key      |
      | PROJ-701 |
      | PROJ-702 |
    And I should not see a bar for "PROJ-703" on the chart
    And I should not see a bar for "PROJ-704" on the chart

  @SC-GANTT-DISP-8
  Scenario: FR-5 — All relation types disabled shows empty state
    Given the issue "PROJ-800" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation        | created    | status | statusCategory | dueDate    |
      | PROJ-801 | Story | subtask         | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-802 | Story | epic-child      | 2026-04-02 | Done   | done           | 2026-04-08 |
      | PROJ-803 | Bug   | blocks (inward) | 2026-04-03 | To Do  | new            | 2026-04-10 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | false              |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see empty state message "Нет связанных задач для отображения диаграммы"
    And I should see an "Open Settings" button
    And I should not see any Gantt bars

  @SC-GANTT-DISP-9
  Scenario: S2 — Start/end mapping by status transition uses changelog dates
    Given the issue "PROJ-900" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate |
      | PROJ-901 | Story | subtask  | 2026-04-01 | Done   | done           | -       |
      | PROJ-902 | Story | subtask  | 2026-04-02 | Done   | done           | -       |
    And the changelog for "PROJ-901" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-02T09:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-05T17:00:00 | In Progress | Done        | indeterminate | done          |
    And the changelog for "PROJ-902" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-03T10:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-07T12:00:00 | In Progress | Done        | indeterminate | done          |
    And Gantt settings are configured with:
      | setting             | value                       |
      | startMapping        | statusTransition: In Progress |
      | endMapping          | statusTransition: Done      |
      | includeSubtasks     | true                        |
      | includeEpicChildren | false                       |
      | includeIssueLinks   | false                       |
      | scope               | _global                     |
    When the Gantt chart is rendered
    Then I should see bars for these issues:
      | key      | startDate           | endDate             |
      | PROJ-901 | 2026-04-02T09:00:00 | 2026-04-05T17:00:00 |
      | PROJ-902 | 2026-04-03T10:00:00 | 2026-04-07T12:00:00 |

  @SC-GANTT-DISP-12
  Scenario: Edge — Issue with only end date and no start date is not shown on chart
    Given the issue "PROJ-1200" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status | statusCategory | dueDate    | summary       |
      | PROJ-1201 | Story | subtask  | 2026-04-01 | Done   | done           | 2026-04-05 | Normal task   |
      | PROJ-1202 | Bug   | subtask  | -          | To Do  | new            | 2026-04-10 | No start task |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-1201" on the chart
    And I should not see a bar for "PROJ-1202" on the chart
    And I should see collapsible section "1 issue not shown"
    When I expand the collapsible section
    Then I should see these missing issues:
      | key       | summary       | reason        |
      | PROJ-1202 | No start task | No start date |

  @SC-GANTT-DISP-13
  Scenario: FR-5 — Include issue links with empty link type list means all link types included
    Given the issue "PROJ-1300" of type "Story" in project "PROJ" has these linked issues:
      | key       | type  | relation              | created    | status | statusCategory | dueDate    |
      | PROJ-1301 | Bug   | blocks (inward)       | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-1302 | Story | is cloned by (inward) | 2026-04-02 | Done   | done           | 2026-04-08 |
      | PROJ-1303 | Task  | relates to (outward)  | 2026-04-03 | To Do  | new            | 2026-04-10 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | false              |
      | includeEpicChildren | false              |
      | includeIssueLinks   | true               |
      | scope               | _global            |
    And issue link type inclusion is configured as empty list
    When the Gantt chart is rendered
    Then I should see bars for these issues:
      | key       |
      | PROJ-1301 |
      | PROJ-1302 |
      | PROJ-1303 |

  @SC-GANTT-DISP-15
  Scenario: FR-5 — epic children included but subtasks excluded filters out subtask issues
    Given the issue "PROJ-1500" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation   | created    | status | statusCategory | dueDate    |
      | PROJ-1501 | Story | subtask    | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-1502 | Story | epic-child | 2026-04-02 | Done   | done           | 2026-04-08 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | false              |
      | includeEpicChildren | true               |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-1502" on the chart
    And I should not see a bar for "PROJ-1501" on the chart

  @SC-GANTT-DISP-16
  Scenario: Edge — statusTransition start mapping with missing transition shows issue in missing dates
    Given the issue "PROJ-1600" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status | statusCategory | dueDate    | summary      |
      | PROJ-1601 | Story | subtask  | 2026-04-01 | Closed | done           | 2026-04-10 | Skipped task |
    And the changelog for "PROJ-1601" contains these status transitions:
      | timestamp           | fromStatus | toStatus | fromCategory | toCategory |
      | 2026-04-01T09:00:00 | -          | To Do    | -            | new        |
      | 2026-04-05T10:00:00 | To Do      | Closed   | new          | done       |
    And Gantt settings are configured with:
      | setting             | value                           |
      | startMapping        | statusTransition: In Progress   |
      | endMapping          | dateField: dueDate              |
      | includeSubtasks     | true                            |
      | includeEpicChildren | false                           |
      | includeIssueLinks   | false                           |
      | scope               | _global                         |
    When the Gantt chart is rendered
    Then I should not see a bar for "PROJ-1601" on the chart
    And I should see collapsible section "1 issue not shown"
    When I expand the collapsible section
    Then I should see these missing issues:
      | key       | summary      | reason                                     |
      | PROJ-1601 | Skipped task | No transition to "In Progress" in changelog |

  @SC-GANTT-DISP-17
  Scenario: FR-6 — Multiple exclusion filters with OR logic
    Given the issue "PROJ-1700" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    | priority |
      | PROJ-1701 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 | High     |
      | PROJ-1702 | Bug   | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 | Trivial  |
      | PROJ-1703 | Task  | subtask  | 2026-04-03 | To Do       | new            | 2026-04-10 | Medium   |
      | PROJ-1704 | Story | subtask  | 2026-04-04 | Cancelled   | done           | 2026-04-12 | High     |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And exclusion filters are configured as:
      | mode  | fieldId  | value     | jql |
      | field | status   | Cancelled |     |
      | field | priority | Trivial   |     |
    When the Gantt chart is rendered
    Then I should see bars for these issues:
      | key       |
      | PROJ-1701 |
      | PROJ-1703 |
    And I should not see a bar for "PROJ-1702" on the chart
    And I should not see a bar for "PROJ-1704" on the chart

  @SC-GANTT-DISP-22
  Scenario: FR-3 — Multi-source end mapping with priority fallback
    Given the issue "PROJ-2200" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-2201 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-2202 | Story | subtask  | 2026-04-02 | Done        | done           | -          |
      | PROJ-2203 | Bug   | subtask  | 2026-04-03 | In Progress | indeterminate  | -          |
    And the changelog for "PROJ-2202" contains these status transitions:
      | timestamp           | fromStatus  | toStatus | fromCategory  | toCategory |
      | 2026-04-04T10:00:00 | In Progress | Done     | indeterminate | done       |
    And the changelog for "PROJ-2203" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory | toCategory    |
      | 2026-04-03T09:00:00 | To Do       | In Progress | new          | indeterminate |
    And Gantt settings are configured with:
      | setting             | value                                       |
      | startMapping        | dateField: created                          |
      | endMapping          | dateField: dueDate, statusTransition: Done  |
      | includeSubtasks     | true                                        |
      | includeEpicChildren | false                                       |
      | includeIssueLinks   | false                                       |
      | scope               | _global                                     |
    When the Gantt chart is rendered
    Then I should see a bar for "PROJ-2201" from "2026-04-01" to "2026-04-05"
    And I should see a bar for "PROJ-2202" from "2026-04-02" to "2026-04-04T10:00:00"
    And I should not see a bar for "PROJ-2203" on the chart
    And I should see collapsible section "1 issue not shown"

  @SC-GANTT-DISP-23
  Scenario: FR-4 — Status section colors fallback to current statuses when changelog lacks category metadata
    Given the issue "PROJ-2300" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-2301 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-08 |
      | PROJ-2302 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-09 |
      | PROJ-2303 | Bug   | subtask  | 2026-04-03 | To Do       | new            | 2026-04-10 |
    And the changelog for "PROJ-2301" contains these status transitions without category metadata:
      | timestamp           | fromStatus  | toStatus    |
      | 2026-04-03T10:00:00 | To Do       | In Progress |
      | 2026-04-06T14:00:00 | In Progress | Done        |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    And I turn on the "Status breakdown" toggle in the Gantt toolbar
    Then the bar for "PROJ-2301" should show these status sections:
      | statusName  | category   | color | from                | to                  |
      | To Do       | todo       | gray  | 2026-04-01T00:00:00 | 2026-04-03T10:00:00 |
      | In Progress | inProgress | blue  | 2026-04-03T10:00:00 | 2026-04-06T14:00:00 |
      | Done        | done       | green | 2026-04-06T14:00:00 | 2026-04-08T00:00:00 |

  @SC-GANTT-DISP-24
  Scenario: P4 — Yellow "No history for X of Y tasks" tag flags bars without changelog history when status breakdown is on
    Given the issue "PROJ-2400" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    | summary        |
      | PROJ-2401 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-07 | Auth service   |
      | PROJ-2402 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 | Payment module |
      | PROJ-2403 | Bug   | subtask  | 2026-04-03 | To Do       | new            | 2026-04-09 | Fix login bug  |
    And the changelog for "PROJ-2401" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-02T10:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-05T14:00:00 | In Progress | Done        | indeterminate | done          |
    And the changelog for "PROJ-2402" has no status transitions inside its bar window
    And the changelog for "PROJ-2403" has no status transitions inside its bar window
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    And I turn on the "Status breakdown" toggle in the Gantt toolbar
    Then I should see a yellow warning tag "No history for 2 of 3 tasks" in the Gantt toolbar
    And the tag is keyboard-focusable and uses a help cursor
    When I hover or focus the "No history for 2 of 3 tasks" tag
    Then a tooltip with the heading "Tasks without status history" appears
    And the tooltip lists these tasks in an Issue / Summary table:
      | key       | summary        |
      | PROJ-2402 | Payment module |
      | PROJ-2403 | Fix login bug  |
    When the changelog for "PROJ-2402" gains status transitions covering its bar window
    Then I should see a yellow warning tag "No history for 1 task" in the Gantt toolbar
    When the changelog for "PROJ-2403" also gains status transitions covering its bar window
    Then I should not see any "No history" tag in the Gantt toolbar

  @SC-GANTT-DISP-25
  Scenario: P4 — Yellow "X tasks not on chart" tag mirrors the missing-dates section as a compact toolbar warning
    Given the issue "PROJ-2500" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    | summary         |
      | PROJ-2501 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 | Normal task     |
      | PROJ-2502 | Story | subtask  | -          | In Progress | indeterminate  | -          | No dates at all |
      | PROJ-2503 | Bug   | subtask  | -          | To Do       | new            | 2026-04-10 | No start date   |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When the Gantt chart is rendered
    Then I should see a yellow warning tag "2 tasks not on chart" in the Gantt toolbar
    And the tag is keyboard-focusable and uses a help cursor
    When I hover or focus the "2 tasks not on chart" tag
    Then a tooltip lists these issues in an Issue / Summary / Reason table:
      | key       | summary         | reason                |
      | PROJ-2502 | No dates at all | No start and end date |
      | PROJ-2503 | No start date   | No start date         |
    When "PROJ-2503" gains a resolvable start date so that only "PROJ-2502" remains without dates
    And the Gantt chart is rendered again
    Then I should see a yellow warning tag "1 task not on chart" in the Gantt toolbar
    When every linked issue has resolvable start and end dates
    And the Gantt chart is rendered again
    Then I should not see any "not on chart" tag in the Gantt toolbar
