Feature: WIP Limit on Cells - Delete

  Удаление ranges и cells из настроек WIP лимитов.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-DELETE-1
  Scenario: Delete a range
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 0        | false   |
    And there is a range "Review Path" with:
      | wipLimit | disable |
      | 0        | false   |
    When I open the settings popup
    And I click "Delete" button in "range Critical Path"
    Then I do not see "Critical Path" in "ranges table"
    And I see "Review Path" in "ranges table"

  @SC-DELETE-2
  Scenario: Delete a cell from range
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 0        | false   |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
      | Backend  | Review      | false     |
    When I open the settings popup
    And I click "Delete" button in "cell Frontend / In Progress"
    Then I do not see "Frontend / In Progress" in "ranges table"
    And I see "Backend / Review" in "ranges table"

  @SC-CLEAR-1
  Scenario: Clear all settings
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 0        | false   |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
    And there is a range "Review Path" with:
      | wipLimit | disable |
      | 0        | false   |
    When I open the settings popup
    And I click "Clear and save all data" button
    Then I do not see the modal "Edit WipLimit on cells"
    And the changes should be saved to Jira board property
