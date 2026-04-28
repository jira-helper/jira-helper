Feature: Progress Status Mapping - Sub-Tasks Progress

  Scenarios for configuring status id to progress bucket mapping in sub-tasks progress settings.
  The mapping is persisted in Jira board property and affects sub-task progress calculation
  without introducing custom progress segments.

  @SC-PSM-SUB-1
  Scenario: Configure sub-tasks progress status id mapping
    Given Jira statuses are available:
      | id    | name              | statusCategory |
      | 10000 | To Do             | new            |
      | 10001 | Ready for Release | indeterminate  |
      | 10002 | Done              | done           |
    And the sub-tasks progress board property has no status progress mapping
    And issue "PROJ-1" has sub-tasks:
      | key    | statusId | statusName        | statusCategory |
      | PROJ-2 | 10001    | Ready for Release | indeterminate  |
      | PROJ-3 | 10002    | Done              | done           |
    When I open sub-tasks progress settings
    And I add a status progress mapping row
    And I select Jira status "Ready for Release" with id "10001"
    And I select progress bucket "Done"
    And I save sub-tasks progress settings
    Then the sub-tasks progress board property should contain status progress mapping:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |
    And sub-task "PROJ-2" should be counted in progress bucket "Done"
    And sub-task "PROJ-3" should be counted in progress bucket "Done"

  @SC-PSM-SUB-2
  Scenario: Sub-tasks progress mapping matches by status id, not status name
    Given the sub-tasks progress board property contains status progress mapping:
      | statusId | statusName        | bucket |
      | 10001    | Ready for Release | done   |
    And issue "PROJ-10" has sub-tasks:
      | key     | statusId | statusName        | statusCategory |
      | PROJ-11 | 10001    | Released          | indeterminate  |
      | PROJ-12 | 20001    | Ready for Release | indeterminate  |
    When sub-tasks progress is calculated for issue "PROJ-10"
    Then sub-task "PROJ-11" should be counted in progress bucket "Done"
    And sub-task "PROJ-12" should be counted in progress bucket "In Progress"
    And fallback status name "Ready for Release" should not be used for matching
