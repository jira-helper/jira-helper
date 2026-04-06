Feature: Column WIP Limits — доступ к табу и совместимость с Board Settings

  Таб регистрируется только при canEdit; данные общие с модалкой
  Board Settings → Columns → Column group WIP limits (один и тот же board property).

  @SC-JHTAB-6
  Scenario: Нет прав на редактирование доски — таб не показывается
    Given I am on the agile board page
    And I do not have permission to edit the board
    When I open the Jira Helper panel
    Then I should not see the "Column WIP Limits" tab

  @SC-JHTAB-7
  Scenario: Совместимость — данные из Board Settings видны в табе на board page
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And column groups were configured via Board Settings modal:
      | name    | columns             | limit |
      | group-1 | In Progress, Review | 5     |
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    Then the "Without Group" section should contain "To Do" and "Done"
    And I should see group "group-1" with columns "In Progress, Review" and limit 5

  @SC-JHTAB-8
  Scenario: Совместимость — данные сохранённые через таб видны в Board Settings
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And no column groups are configured
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    And I drag "In Progress" column to create a new group in the tab
    And I set limit to 7
    And I click "Save"
    And I open the Board Settings column limits modal
    Then I should see group with column "In Progress" and limit 7
