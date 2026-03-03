Feature: WIP Limit on Cells Settings Modal Lifecycle

  Жизненный цикл модального окна настроек WIP лимитов по ячейкам.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-MODAL-1
  Scenario: Open settings popup
    When I click "Edit Wip limits by cells"
    Then I see the modal "Edit WipLimit on cells"
    And I see input "Add range"
    And I see dropdown "swimlane"
    And I see dropdown "Column"
    And I see checkbox "show indicator" is unchecked
    And I should see the ranges table

  @SC-MODAL-2
  Scenario: Save and close popup
    Given I have opened the "Edit WipLimit on cells" popup
    And I type "Test Range" into "Add range" input
    And I select "Frontend" from "swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    And I should see "Test Range" in the ranges table
    When I click "Save" button
    Then I do not see the modal "Edit WipLimit on cells"
    And the changes should be saved to Jira board property

  @SC-MODAL-3
  Scenario: Cancel closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I type "Test Range" into "Add range" input
    And I select "Frontend" from "swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    And I should see "Test Range" in the ranges table
    When I click "Cancel" button
    Then I do not see the modal "Edit WipLimit on cells"
    And the changes should not be saved

  @SC-MODAL-4
  Scenario: Close button (X) closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I type "Test Range" into "Add range" input
    And I select "Frontend" from "swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    And I should see "Test Range" in the ranges table
    When I click the close button (X)
    Then I do not see the modal "Edit WipLimit on cells"
    And the changes should not be saved
