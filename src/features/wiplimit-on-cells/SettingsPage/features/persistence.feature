Feature: WIP Limit on Cells - Persistence

  Сохранение и загрузка настроек WIP лимитов.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-PERSIST-1
  Scenario: Save persists to Jira board property
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
    When I open the settings popup
    And I click "Save" button
    Then the changes should be saved to Jira board property

  @SC-PERSIST-3
  Scenario: Changes persist after reopening modal
    When I open the settings popup
    And I add a range "Test Range"
    And I click "Save" button
    And I reopen the modal
    Then I should see range "Test Range" in the table

  @SC-PERSIST-2
  Scenario: Settings load on page open
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
    And there is a range "Review Path" with:
      | wipLimit | disable |
      | 3        | false   |
    And the range "Review Path" has cells:
      | swimlane | column | showBadge |
      | Backend  | Review | true      |
    When I open the settings popup
    Then I see input "Critical Path" in ranges table
    And I see input "Review Path" in ranges table
    And the range "Critical Path" should have WIP limit 5
    And the range "Review Path" should have WIP limit 3

  @SC-COMPAT-1
  Scenario: Load settings with legacy "swimline" field
    Given there are legacy settings with swimline "Critical Path" cell "Frontend / In Progress"
    When I open the settings popup
    Then I see input "Critical Path" in ranges table
    And I see "Frontend / In Progress" in "ranges table"
