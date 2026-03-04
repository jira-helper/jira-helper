Feature: WIP Limit on Cells - Edit Range

  Редактирование существующих ranges: имя, WIP лимит, disable флаг.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-EDIT-1
  Scenario: Edit range name inline
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 5        | false   |
    When I open the settings popup
    And I change the name of range "Critical Path" to "Hot Path"
    And I click away to confirm
    Then I see input "Hot Path" in ranges table
    And I do not see input "Critical Path" in ranges table

  @SC-EDIT-2
  Scenario: Edit WIP limit inline
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 5        | false   |
    When I open the settings popup
    And I change the WIP limit of range "Critical Path" to "10"
    And I click away to confirm
    Then the range "Critical Path" should have WIP limit 10

  @SC-EDIT-3
  Scenario: Toggle disable checkbox
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 0        | false   |
    When I open the settings popup
    And I check "Disable" for range "Critical Path"
    Then I see "Disable" checked for range "Critical Path"

  @SC-EDIT-4
  Scenario: Select range for editing via edit icon
    Given there is a range "Critical Path" with:
      | wipLimit | disable |
      | 0        | false   |
    When I open the settings popup
    And I click the edit icon for range "Critical Path"
    Then I see input "Add range" has value "Critical Path"
    And I see "Add cell" button
