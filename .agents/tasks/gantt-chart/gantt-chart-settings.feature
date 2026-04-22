Feature: Gantt Chart - Settings

  Сценарии первого запуска, настройки start/end mapping, фильтра исключений,
  каскадных scope (global / project / project + issue type), переключения scope,
  копирования настроек через «Copy from…», и конфигурации включения по типам связи.

  @SC-GANTT-SET-1
  Scenario: S1 — First open without saved settings shows first-run state
    Given the issue "PROJ-100" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate    |
      | PROJ-101 | Story | subtask  | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-102 | Bug   | subtask  | 2026-04-02 | To Do  | new            | 2026-04-08 |
    And no Gantt settings exist in storage
    When the issue view page has loaded
    Then I should see first-run message "Настройте параметры диаграммы"
    And I should see "Open Settings" button
    And I should not see any Gantt bars

  @SC-GANTT-SET-2
  Scenario: S3 — Configure start mapping as date field and end mapping as status transition
    Given the issue "PROJ-200" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status | statusCategory | dueDate |
      | PROJ-201 | Story | subtask  | 2026-04-01 | Done   | done           | -       |
      | PROJ-202 | Story | subtask  | 2026-04-03 | Done   | done           | -       |
    And the changelog for "PROJ-201" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-02T10:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-04T14:00:00 | In Progress | Done        | indeterminate | done          |
    And the changelog for "PROJ-202" contains these status transitions:
      | timestamp           | fromStatus  | toStatus    | fromCategory  | toCategory    |
      | 2026-04-04T09:00:00 | To Do       | In Progress | new           | indeterminate |
      | 2026-04-06T16:00:00 | In Progress | Done        | indeterminate | done          |
    And no Gantt settings exist in storage
    When I open Gantt settings from the gear button
    And I set start mapping to "Date field" with field "Created"
    And I set end mapping to "Status transition" with status "Done"
    And I set include subtasks to true
    And I click "Save"
    Then the settings modal should close
    And the Gantt chart should render with bars:
      | key      | startDate  | endDate             |
      | PROJ-201 | 2026-04-01 | 2026-04-04T14:00:00 |
      | PROJ-202 | 2026-04-03 | 2026-04-06T16:00:00 |
    And localStorage key "jh-gantt-settings" should contain scope "_global" with:
      | setting      | value                      |
      | startMapping | dateField: created         |
      | endMapping   | statusTransition: Done     |

  @SC-GANTT-SET-3
  Scenario: S8 — Exclude issues via IssueSelectorByAttributes field filter
    Given the issue "PROJ-300" of type "Epic" in project "PROJ" has these linked issues:
      | key      | type  | relation | created    | status      | statusCategory | dueDate    |
      | PROJ-301 | Story | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJ-302 | Story | subtask  | 2026-04-02 | In Progress | indeterminate  | 2026-04-08 |
      | PROJ-303 | Bug   | subtask  | 2026-04-03 | Done        | done           | 2026-04-10 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    And the Gantt chart is displayed with bars for "PROJ-301", "PROJ-302", "PROJ-303"
    When I open Gantt settings from the gear button
    And I configure exclusion filter with mode "field", field "Status", value "Done"
    And I click "Save"
    Then I should see a bar for "PROJ-302" on the chart
    And I should not see a bar for "PROJ-301" on the chart
    And I should not see a bar for "PROJ-303" on the chart

  @SC-GANTT-SET-4
  Scenario: S11 — Create project+issueType scope with Copy from Global
    Given these Gantt scopes exist in storage:
      | scope   | startMapping       | endMapping             | labelFieldId | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global | dateField: created | statusTransition: Done | key          | true            | false               | false             |
    And I opened issue view for issue "PROJA-50" of type "Story" in project "PROJA"
    When I open Gantt settings from the gear button
    And I select scope "This project + issue type"
    And I click "Copy from…"
    And I choose to copy from "Global"
    And I confirm copy
    Then the settings form should show:
      | setting      | value                      |
      | startMapping | dateField: created         |
      | endMapping   | statusTransition: Done     |
      | labelFieldId | key                        |
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

  @SC-GANTT-SET-5
  Scenario: S11 — Resolved settings use most specific scope for matching issue type
    Given these Gantt scopes exist in storage:
      | scope        | startMapping         | endMapping                 | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global      | dateField: created   | statusTransition: Done     | true            | false               | false             |
      | PROJA:Story  | dateField: startDate | statusTransition: Released | true            | false               | false             |
    And the issue "PROJA-60" of type "Story" in project "PROJA" has these linked issues:
      | key      | type  | relation | startDate  | created    | status   | statusCategory | dueDate |
      | PROJA-61 | Task  | subtask  | 2026-04-05 | 2026-04-01 | Released | done           | -       |
    And the changelog for "PROJA-61" contains these status transitions:
      | timestamp           | fromStatus  | toStatus | fromCategory  | toCategory |
      | 2026-04-06T10:00:00 | In Progress | Released | indeterminate | done       |
    When the issue view page has loaded
    Then the resolved scope should be "PROJA:Story"
    And I should see a bar for "PROJA-61" from "2026-04-05" to "2026-04-06T10:00:00"

  @SC-GANTT-SET-6
  Scenario: S11 — Non-matching issue type falls back to global scope
    Given these Gantt scopes exist in storage:
      | scope        | startMapping         | endMapping                 | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global      | dateField: created   | statusTransition: Done     | true            | false               | false             |
      | PROJA:Story  | dateField: startDate | statusTransition: Released | true            | false               | false             |
    And the issue "PROJA-70" of type "Bug" in project "PROJA" has these linked issues:
      | key      | type | relation | created    | status | statusCategory | dueDate |
      | PROJA-71 | Task | subtask  | 2026-04-01 | Done   | done           | -       |
    And the changelog for "PROJA-71" contains these status transitions:
      | timestamp           | fromStatus  | toStatus | fromCategory  | toCategory |
      | 2026-04-03T15:00:00 | In Progress | Done     | indeterminate | done       |
    When the issue view page has loaded
    Then the resolved scope should be "_global"
    And I should see a bar for "PROJA-71" from "2026-04-01" to "2026-04-03T15:00:00"

  @SC-GANTT-SET-7
  Scenario: Edge — Switching scope in settings updates form fields to match selected scope
    Given these Gantt scopes exist in storage:
      | scope        | startMapping         | endMapping                 | labelFieldId | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global      | dateField: created   | statusTransition: Done     | key          | true            | false               | false             |
      | PROJB        | dateField: startDate | dateField: dueDate         | summary      | true            | false               | false             |
      | PROJB:Story  | dateField: created   | statusTransition: Released | key          | true            | false               | false             |
    And I opened issue view for issue "PROJB-10" of type "Story" in project "PROJB"
    When I open Gantt settings from the gear button
    And I select scope "Global"
    Then the settings form should show:
      | setting      | value                  |
      | startMapping | dateField: created     |
      | endMapping   | statusTransition: Done |
      | labelFieldId | key                    |
    When I select scope "This project"
    Then the settings form should show:
      | setting      | value              |
      | startMapping | dateField: startDate |
      | endMapping   | dateField: dueDate |
      | labelFieldId | summary            |
    When I select scope "This project + issue type"
    Then the settings form should show:
      | setting      | value                      |
      | startMapping | dateField: created         |
      | endMapping   | statusTransition: Released |
      | labelFieldId | key                        |

  @SC-GANTT-SET-8
  Scenario: Edge — Copy from project scope into new project+issueType scope
    Given these Gantt scopes exist in storage:
      | scope   | startMapping         | endMapping         | labelFieldId | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global | dateField: created   | dateField: dueDate | key          | true            | false               | false             |
      | PROJC   | dateField: startDate | dateField: dueDate | summary      | true            | false               | false             |
    And I opened issue view for issue "PROJC-20" of type "Bug" in project "PROJC"
    When I open Gantt settings from the gear button
    And I select scope "This project + issue type"
    And I click "Copy from…"
    Then I should see these scope options in the copy dialog:
      | scope   |
      | _global |
      | PROJC   |
    When I choose to copy from "PROJC"
    And I confirm copy
    Then the settings form should show:
      | setting      | value                |
      | startMapping | dateField: startDate |
      | endMapping   | dateField: dueDate   |
      | labelFieldId | summary              |
    When I click "Save"
    Then localStorage key "jh-gantt-settings" should contain scope "PROJC:Bug" with:
      | setting      | value                |
      | startMapping | dateField: startDate |
      | endMapping   | dateField: dueDate   |
      | labelFieldId | summary              |

  @SC-GANTT-SET-9
  Scenario: FR-5 — Configure link type inclusion in settings
    Given the issue "PROJ-900" of type "Story" in project "PROJ" has these linked issues:
      | key      | type | relation              | created    | status | statusCategory | dueDate    |
      | PROJ-901 | Bug  | blocks (inward)       | 2026-04-01 | Done   | done           | 2026-04-05 |
      | PROJ-902 | Task | is cloned by (inward) | 2026-04-02 | Done   | done           | 2026-04-08 |
      | PROJ-903 | Task | relates to (outward)  | 2026-04-03 | Done   | done           | 2026-04-10 |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | false              |
      | includeEpicChildren | false              |
      | includeIssueLinks   | true               |
      | scope               | _global            |
    And issue link type inclusion is configured as empty list
    And the chart shows bars for "PROJ-901", "PROJ-902", "PROJ-903"
    When I open Gantt settings from the gear button
    And I configure issue link types to include only:
      | linkType | direction |
      | blocks   | inward    |
    And I click "Save"
    Then I should see a bar for "PROJ-901" on the chart
    And I should not see a bar for "PROJ-902" on the chart
    And I should not see a bar for "PROJ-903" on the chart

  @SC-GANTT-SET-10
  Scenario: Edge — Project-level scope overrides global for all issue types in that project
    Given these Gantt scopes exist in storage:
      | scope   | startMapping         | endMapping             | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global | dateField: created   | statusTransition: Done | true            | false               | false             |
      | PROJD   | dateField: startDate | dateField: dueDate     | true            | false               | false             |
    And the issue "PROJD-10" of type "Story" in project "PROJD" has these linked issues:
      | key      | type | relation | startDate  | created    | status | statusCategory | dueDate    |
      | PROJD-11 | Task | subtask  | 2026-04-05 | 2026-04-01 | Done   | done           | 2026-04-10 |
    And Gantt settings are configured with:
      | setting             | value |
      | includeSubtasks     | true  |
      | includeEpicChildren | false |
      | includeIssueLinks   | false |
    When the issue view page has loaded
    Then the resolved scope should be "PROJD"
    And I should see a bar for "PROJD-11" from "2026-04-05" to "2026-04-10"

  @SC-GANTT-SET-12
  Scenario: FR-10 — Settings modal opens at the effective scope when the current scope has no direct settings
    Given these Gantt scopes exist in storage:
      | scope   | startMapping       | endMapping             | includeSubtasks | includeEpicChildren | includeIssueLinks |
      | _global | dateField: created | statusTransition: Done | true            | false               | false             |
      | PROJE   | dateField: created | dateField: dueDate     | true            | false               | false             |
    And the persisted preferredScopeLevel is "projectIssueType"
    And I opened issue view for issue "PROJE-10" of type "Story" in project "PROJE"
    When I open Gantt settings from the gear button
    Then the scope picker should show "Project" selected
    And the settings form should show:
      | setting      | value              |
      | startMapping | dateField: created |
      | endMapping   | dateField: dueDate |

  @SC-GANTT-SET-13
  Scenario: FR-3 — Add a fallback mapping with priority controls
    Given no Gantt settings exist in storage
    And the issue "PROJF-10" of type "Story" in project "PROJF" has these linked issues:
      | key       | type | relation | created    | status      | statusCategory | dueDate    |
      | PROJF-11  | Task | subtask  | 2026-04-01 | Done        | done           | 2026-04-05 |
      | PROJF-12  | Task | subtask  | 2026-04-02 | Done        | done           | -          |
    And the changelog for "PROJF-12" contains these status transitions:
      | timestamp           | fromStatus  | toStatus | fromCategory  | toCategory |
      | 2026-04-04T10:00:00 | In Progress | Done     | indeterminate | done       |
    When I open Gantt settings from the gear button
    And I set start mapping to "Date field" with field "created"
    And I set end mapping to "Date field" with field "duedate"
    And I add a fallback row to "End of bar" with "Status transition" and value "Done"
    And I click "Save"
    Then the settings modal should close
    And localStorage key "jh-gantt-settings" should contain scope "_global" with:
      | setting       | value                                       |
      | startMapping  | dateField: created                          |
      | endMappings   | dateField: duedate, statusTransition: Done  |
    And I should see a bar for "PROJF-11" from "2026-04-01" to "2026-04-05"
    And I should see a bar for "PROJF-12" from "2026-04-02" to "2026-04-04T10:00:00"

  @SC-GANTT-SET-11
  Scenario: Edge — Hover detail fields are configurable in settings
    Given the issue "PROJ-1100" of type "Epic" in project "PROJ" has these linked issues:
      | key       | type  | relation | created    | status      | statusCategory | dueDate    | summary      | assignee  | priority |
      | PROJ-1101 | Story | subtask  | 2026-04-01 | In Progress | indeterminate  | 2026-04-08 | Auth service | john.doe  | High     |
    And Gantt settings are configured with:
      | setting             | value              |
      | startMapping        | dateField: created |
      | endMapping          | dateField: dueDate |
      | includeSubtasks     | true               |
      | includeEpicChildren | false              |
      | includeIssueLinks   | false              |
      | scope               | _global            |
    When I open Gantt settings from the gear button
    And I select hover detail fields "Summary", "Assignee", "Priority"
    And I click "Save"
    Then the settings should be saved with tooltipFieldIds "summary", "assignee", "priority"
