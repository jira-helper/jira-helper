Feature: WIP Limit on Cells - Add Range and Cells

  Добавление новых ranges и cells в настройки WIP лимитов.

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  @SC-ADD-1
  Scenario: Add a new range with a cell
    When I open the settings popup
    And I type "Critical Path" into "Add range" input
    And I select "Frontend" from "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I check "show indicator"
    And I click "Add range" button
    Then I should see "Critical Path" in the ranges table
    And the range "Critical Path" should have WIP limit 0
    And the range "Critical Path" should contain cell "Frontend / In Progress"
    And the cell "Frontend / In Progress" should have the badge indicator icon

  @SC-ADD-2
  Scenario: Cannot add range without name - shows validation error
    When I open the settings popup
    And I select "Frontend" from "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    Then I see text "Enter range name"
    And the ranges table should be empty

  @SC-ADD-2a
  Scenario: Validation error disappears after entering name
    When I open the settings popup
    And I select "Frontend" from "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add range" button
    Then I see text "Enter range name"
    When I type "My Range" into "Add range" input
    Then I do not see text "Enter range name"

  # Note: Дублирование имени range невозможно из-за архитектуры UI.
  # При вводе существующего имени кнопка автоматически меняется на "Add cell" (см. SC-CELL-1).
  # Это предотвращает создание дублирующихся ranges.

  @SC-CELL-1
  Scenario: Button changes to "Add cell" when range name matches existing range
    Given there is a range "Critical Path" with:
      | wipLimit | 0     |
      | disable  | false |
    When I open the settings popup
    And I type "Critical Path" into "Add range" input
    Then I see "Add cell" button

  @SC-CELL-2
  Scenario: Button shows "Add range" for new name
    Given there is a range "Critical Path" with:
      | wipLimit | 0     |
      | disable  | false |
    When I open the settings popup
    And I type "New Range" into "Add range" input
    Then I see "Add range" button

  @SC-CELL-3
  Scenario: Add cell to existing range
    Given there is a range "Critical Path" with:
      | wipLimit | 0     |
      | disable  | false |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
    When I open the settings popup
    And I type "Critical Path" into "Add range" input
    And I select "Backend" from "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add cell" button
    Then the range "Critical Path" should contain cells:
      | swimlane | column      |
      | Frontend | In Progress |
      | Backend  | In Progress |

  @SC-CELL-4
  Scenario: Cannot add duplicate cell to range
    Given there is a range "Critical Path" with:
      | wipLimit | 0     |
      | disable  | false |
    And the range "Critical Path" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | false     |
    When I open the settings popup
    And I type "Critical Path" into "Add range" input
    And I select "Frontend" from "Swimlane" dropdown
    And I select "In Progress" from "Column" dropdown
    And I click "Add cell" button
    Then the range "Critical Path" should contain cells:
      | swimlane | column      |
      | Frontend | In Progress |
