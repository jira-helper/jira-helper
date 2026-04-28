Feature: Progress Status Mapping - Gantt

  Scenarios for configuring status id to progress bucket mapping in Gantt settings.
  The mapping is persisted through the existing Gantt localStorage settings and Gantt
  status transition rules compare Jira changelog ids, not display names.

  @SC-PSM-GANTT-1
  Scenario: Configure Gantt status id mapping
    Given Jira statuses are available:
      | id    | name              | statusCategory |
      | 10000 | To Do             | new            |
      | 10001 | Ready for Release | indeterminate  |
      | 10002 | Done              | done           |
    And no Gantt settings exist in storage
    And issue "PROJ-1" has linked issues:
      | key    | statusId | statusName        | statusCategory |
      | PROJ-2 | 10001    | Ready for Release | indeterminate  |
      | PROJ-3 | 10002    | Done              | done           |
    When I open Gantt settings
    And I add a status progress mapping row
    And I select Jira status "Ready for Release" with id "10001"
    And I select progress bucket "Done"
    And I save Gantt settings
    Then Gantt settings storage should contain status progress mapping:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |
    And linked issue "PROJ-2" should be counted in progress bucket "Done"
    And linked issue "PROJ-3" should be counted in progress bucket "Done"

  @SC-PSM-GANTT-2
  Scenario: Gantt status transition mapping matches changelog from and to ids
    Given Jira statuses are available:
      | id    | name        | statusCategory |
      | 10000 | To Do       | new            |
      | 10001 | In Progress | indeterminate  |
      | 10002 | Done        | done           |
      | 20002 | Done        | done           |
    And these Gantt mappings exist in storage:
      | scope  | startMapping              | endMapping                    |
      | global | statusTransitionId: 10001 | statusTransitionId: 10002     |
    And issue "PROJ-20" has linked issue "PROJ-21"
    And the changelog for "PROJ-21" contains these status transitions:
      | timestamp           | fromStatusId | fromStatusName | toStatusId | toStatusName |
      | 2026-04-01T09:00:00 | 10000        | To Do          | 10001      | Doing        |
      | 2026-04-03T18:00:00 | 10001        | Doing          | 10002      | Fertig       |
      | 2026-04-04T18:00:00 | 10001        | Doing          | 20002      | Done         |
    When the Gantt chart is calculated for issue "PROJ-20"
    Then I should see a Gantt bar for "PROJ-21" from "2026-04-01" to "2026-04-03"
    And the status transition end mapping should match changelog to id "10002"
    And the status transition end mapping should not match changelog toString "Done"

  @SC-PSM-GANTT-3
  Scenario: Legacy status transition name is fallback metadata only
    Given these Gantt mappings exist in storage:
      | scope  | startMapping       | endMapping                 |
      | global | dateField: created | statusTransitionName: Done |
    And issue "PROJ-30" has linked issue "PROJ-31"
    And the changelog for "PROJ-31" contains these status transitions:
      | timestamp           | fromStatusId | fromStatusName | toStatusId | toStatusName |
      | 2026-04-05T10:00:00 | 10001        | In Progress    | 10002      | Done         |
    When the Gantt chart is calculated for issue "PROJ-30"
    Then the legacy status transition name "Done" should be shown as fallback/debug metadata
    And no Gantt bar end date should be resolved from status transition name "Done"
