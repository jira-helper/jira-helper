Feature: WIP Limit on Cells - Dashed Borders
  As a team member
  I want to see dashed borders around WIP limit range cells
  So that I can visually identify which cells belong to the same range

  Background:
    Given the board is loaded
    And there are columns:
      | id   | name        |
      | col1 | To Do       |
      | col2 | In Progress |
      | col3 | Review      |
      | col4 | Done        |
    And there are swimlanes:
      | id  | name     |
      | sw1 | Frontend |
      | sw2 | Backend  |
      | sw3 | QA       |

  @SC-BORDER-1
  Scenario: Single cell gets all four borders
    Given there is a range "Solo" with:
      | wipLimit | disable |
      | 5        | false   |
    And the range "Solo" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
    When the board is displayed
    Then the cell "Frontend / In Progress" should have dashed border on top
    And the cell "Frontend / In Progress" should have dashed border on bottom
    And the cell "Frontend / In Progress" should have dashed border on left
    And the cell "Frontend / In Progress" should have dashed border on right

  @SC-BORDER-2
  Scenario: Adjacent cells in same row share inner borders
    Given there is a range "Row Range" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "Row Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Frontend | Review      | false     |
    When the board is displayed
    Then the cell "Frontend / In Progress" should have dashed border on top
    And the cell "Frontend / In Progress" should have dashed border on bottom
    And the cell "Frontend / In Progress" should have dashed border on left
    And the cell "Frontend / In Progress" should not have dashed border on right
    And the cell "Frontend / Review" should have dashed border on top
    And the cell "Frontend / Review" should have dashed border on bottom
    And the cell "Frontend / Review" should have dashed border on right
    And the cell "Frontend / Review" should not have dashed border on left

  @SC-BORDER-3
  Scenario: Adjacent cells in same column share inner borders
    Given there is a range "Column Range" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "Column Range" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | false     |
    When the board is displayed
    Then the cell "Frontend / In Progress" should have dashed border on left
    And the cell "Frontend / In Progress" should have dashed border on right
    And the cell "Frontend / In Progress" should have dashed border on top
    And the cell "Frontend / In Progress" should not have dashed border on bottom
    And the cell "Backend / In Progress" should have dashed border on left
    And the cell "Backend / In Progress" should have dashed border on right
    And the cell "Backend / In Progress" should have dashed border on bottom
    And the cell "Backend / In Progress" should not have dashed border on top

  @SC-BORDER-4
  Scenario: L-shaped range has correct borders
    Given there is a range "L-Shape" with:
      | wipLimit | disable |
      | 10       | false   |
    And the range "L-Shape" has cells:
      | swimlane | column      | showBadge |
      | Frontend | In Progress | true      |
      | Backend  | In Progress | false     |
      | Backend  | Review      | false     |
    When the board is displayed
    Then the cell "Frontend / In Progress" should have dashed border on top
    And the cell "Frontend / In Progress" should have dashed border on left
    And the cell "Frontend / In Progress" should have dashed border on right
    And the cell "Backend / Review" should have dashed border on bottom
    And the cell "Backend / Review" should have dashed border on right
