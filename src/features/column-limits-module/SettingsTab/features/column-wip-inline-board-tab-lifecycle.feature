Feature: Column WIP Limits — таб Jira Helper на board page (lifecycle)

  Перенос UI CONWIP: те же действия, что в модалке Board Settings, но через таб
  в панели Jira Helper на agile board page. Один board property `WIP_LIMITS_SETTINGS`.

  # Навигация: Given I am on the agile board page; When I open the Jira Helper panel; And I select the "Column WIP Limits" tab
  # Создание группы: см. column-limits SettingsPage features (drag в dropzone, лимит, Save configuration)
  # Dropzone на табе использует id jh-tab-column-dropzone (отличается от модалки)

  @SC-JHTAB-1
  Scenario: Empty state — все колонки в Without Group
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And no column groups are configured
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    Then the "Without Group" section should contain all columns
    And there should be no configured groups

  @SC-JHTAB-2
  Scenario: Happy path — открыть таб, создать группу, Save configuration
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And no column groups are configured
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    And I drag "In Progress" column to create a new group in the tab
    And I set limit to 5
    And I click "Save configuration"
    Then group containing column "In Progress" should have limit 5 in property

  @SC-JHTAB-3
  Scenario: Редактирование существующей группы через таб
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    And I change group "group-1" limit to 10
    And I click "Save configuration"
    Then group "group-1" should have limit 10 in property

  @SC-JHTAB-4
  Scenario: Discard changes — отмена несохранённых изменений
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    And I change group "group-1" limit to 99
    And I click "Discard changes"
    Then group "group-1" should have limit 5 in property

  @SC-JHTAB-5
  Scenario: Закрыть панель без сохранения конфигурации — изменения не сохраняются
    Given I am on the agile board page
    And I have permission to edit the board
    And there are columns "To Do, In Progress, Review, Done" on the board
    And no column groups are configured
    When I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    And I drag "In Progress" column to create a new group in the tab
    And I set limit to 3
    And I close the Jira Helper panel without saving
    And I open the Jira Helper panel
    And I select the "Column WIP Limits" tab
    Then there should be no configured groups
