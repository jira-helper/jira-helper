Feature: WIP Limit on Cells - Validation

  Валидация форм при добавлении ranges и cells.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-VALID-1
  Scenario: Cannot add range or cell without selecting swimlane
    When I open the settings popup
    And I type "My Range" into "Add range" input
    And I see "-" selected in "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    Then I see text "Select swimlane"
    And I see "Swimlane" field has error

  @SC-VALID-1a
  Scenario: Swimlane validation error disappears after selecting value
    When I open the settings popup
    And I type "My Range" into "Add range" input
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    Then I see text "Select swimlane"
    And I see "Swimlane" field has error
    When I select "Frontend" from "Swimlane" dropdown
    Then I do not see text "Select swimlane"

  @SC-VALID-2
  Scenario: Cannot add range or cell without selecting column
    When I open the settings popup
    And I type "My Range" into "Add range" input
    And I select "Frontend" from "Swimlane" dropdown
    And I see "-" selected in "Column" dropdown
    And I click "Add range" button
    Then I see text "Select Column"
    And I see "Column" field has error
