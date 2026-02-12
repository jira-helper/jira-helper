Feature: WIP Limit on Cells Settings
  As a board administrator
  I want to manage WIP limits for specific board cells (swimlane/column combinations)
  So that I can control workload distribution across cell groups

  Background:
    Given I am on the WIP Limit on Cells settings page
    And there are columns "To Do, In Progress, Review, Done" on the board
    And there are swimlanes "Frontend, Backend, QA" on the board

  # === OPEN / CLOSE POPUP ===

  @SC1
  Scenario: SC1: Open settings popup
    When I click "Edit Wip limits by cells"
    Then I should see the "Edit WipLimit on cells" popup
    And I should see the "Add range" form
    And I should see the swimlane dropdown
    And I should see the column dropdown
    And I should see the "show indicator" checkbox
    And I should see the ranges table

  @SC2
  Scenario: SC2: Save and close popup
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click "Save"
    Then the popup should close
    And the changes should be saved to Jira board property

  @SC3
  Scenario: SC3: Cancel closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click "Cancel"
    Then the popup should close
    And the changes should not be saved

  @SC26
  Scenario: SC26: Close button (X) closes popup without saving
    Given I have opened the "Edit WipLimit on cells" popup
    And I have made some changes
    When I click the close button (X)
    Then the popup should close
    And the changes should not be saved

  # === ADD RANGE ===

  @SC4
  Scenario: SC4: Add a new range with a cell
    When I open the settings popup
    And I enter range name "Critical Path"
    And I select swimlane "Frontend"
    And I select column "In Progress"
    And I check "show indicator"
    And I click "Add range"
    Then I should see "Critical Path" in the ranges table
    And the range "Critical Path" should have WIP limit 0
    And the range "Critical Path" should contain cell "Frontend / In Progress"
    And the cell "Frontend / In Progress" should have the badge indicator icon

  @SC5
  Scenario: SC5: Cannot add range without name
    When I open the settings popup
    And I leave the range name empty
    And I select swimlane "Frontend"
    And I select column "In Progress"
    And I click "Add range"
    Then I should see an alert "Enter range name"
    And the ranges table should remain unchanged

  @SC6
  Scenario: SC6: Cannot add range with duplicate name
    Given there is a range "Critical Path" in the settings
    When I open the settings popup
    And I enter range name "Critical Path"
    And I select swimlane "Backend"
    And I select column "Review"
    And I click "Add range"
    Then I should see an alert "Enter unique range name"

  # === ADD CELL TO EXISTING RANGE ===

  @SC7
  Scenario: SC7: Button changes to "Add cell" when range name matches existing range
    Given there is a range "Critical Path" in the settings
    When I open the settings popup
    And I enter range name "Critical Path"
    Then the button should show "Add cell"

  @SC8
  Scenario: SC8: Button shows "Add range" for new name
    Given there is a range "Critical Path" in the settings
    When I open the settings popup
    And I enter range name "New Range"
    Then the button should show "Add range"

  @SC9
  Scenario: SC9: Add cell to existing range
    Given there is a range "Critical Path" with cell "Frontend / In Progress"
    When I open the settings popup
    And I enter range name "Critical Path"
    And I select swimlane "Backend"
    And I select column "In Progress"
    And I click "Add cell"
    Then the range "Critical Path" should contain cells:
      | swimlane | column      |
      | Frontend | In Progress |
      | Backend  | In Progress |

  @SC10
  Scenario: SC10: Cannot add duplicate cell to range
    Given there is a range "Critical Path" with cell "Frontend / In Progress"
    When I open the settings popup
    And I enter range name "Critical Path"
    And I select swimlane "Frontend"
    And I select column "In Progress"
    And I click "Add cell"
    Then the range "Critical Path" should still have only one cell "Frontend / In Progress"

  # === VALIDATION ===

  @SC11
  Scenario: SC11: Cannot add range or cell without selecting swimlane
    When I open the settings popup
    And I enter range name "My Range"
    And I leave swimlane as "-"
    And I select column "In Progress"
    And I click "Add range"
    Then I should see an alert "need choose swimlane and column and try again."

  @SC12
  Scenario: SC12: Cannot add range or cell without selecting column
    When I open the settings popup
    And I enter range name "My Range"
    And I select swimlane "Frontend"
    And I leave column as "-"
    And I click "Add range"
    Then I should see an alert "need choose swimlane and column and try again."

  # === EDIT RANGE ===

  @SC13
  Scenario: SC13: Edit range name inline
    Given there is a range "Critical Path" with WIP limit 5
    When I open the settings popup
    And I change the name of range "Critical Path" to "Hot Path"
    And I click away to confirm
    Then the range should be renamed to "Hot Path"

  @SC14
  Scenario: SC14: Edit WIP limit inline
    Given there is a range "Critical Path" with WIP limit 5
    When I open the settings popup
    And I change the WIP limit of "Critical Path" to 10
    And I click away to confirm
    Then the range "Critical Path" should have WIP limit 10

  @SC15
  Scenario: SC15: Toggle disable checkbox
    Given there is a range "Critical Path" that is not disabled
    When I open the settings popup
    And I check the "Disable" checkbox for "Critical Path"
    Then the range "Critical Path" should be marked as disabled

  @SC16
  Scenario: SC16: Select range for editing via edit icon
    Given there is a range "Critical Path"
    When I open the settings popup
    And I click the edit icon on range "Critical Path"
    Then the range name input should show "Critical Path"
    And the button should show "Add cell"

  # === DELETE ===

  @SC17
  Scenario: SC17: Delete a range
    Given there are ranges "Critical Path" and "Review Path"
    When I open the settings popup
    And I click the delete icon on range "Critical Path"
    Then "Critical Path" should not be in the ranges table
    And "Review Path" should still be in the ranges table

  @SC18
  Scenario: SC18: Delete a cell from range
    Given there is a range "Critical Path" with cells "Frontend / In Progress" and "Backend / Review"
    When I open the settings popup
    And I click the delete icon on cell "Frontend / In Progress" in range "Critical Path"
    Then the range "Critical Path" should not contain "Frontend / In Progress"
    And the range "Critical Path" should still contain "Backend / Review"

  # === CLEAR ALL ===

  @SC19
  Scenario: SC19: Clear all settings
    Given there are ranges "Critical Path" and "Review Path" with configured cells
    When I open the settings popup
    And I click "Clear and save all data"
    Then all ranges should be removed
    And the Jira board property should be cleared
    And the popup should re-open with empty state

  # === PERSISTENCE ===

  @SC20
  Scenario: SC20: Save persists to Jira board property
    Given I have configured range "Critical Path" with WIP limit 5 and cells
    When I click "Save"
    Then the settings should be saved to the Jira board property "WIP_LIMITS_CELLS"

  @SC21
  Scenario: SC21: Settings load on page open
    Given there are saved WIP limit settings in the Jira board property
    When I open the settings popup
    Then I should see the previously saved ranges and cells

  # === BACKWARD COMPATIBILITY ===

  @SC22
  Scenario: SC22: Load settings with legacy "swimline" field
    Given there are saved settings with the legacy "swimline" field instead of "swimlane"
    When I open the settings popup
    Then the settings should load correctly
    And the "swimline" values should be treated as "swimlane"

  # === SHOW BADGE ===

  @SC23
  Scenario: SC23: Add cell with show badge indicator
    When I open the settings popup
    And I enter range name "My Range"
    And I select swimlane "Frontend"
    And I select column "In Progress"
    And I check "show indicator"
    And I click "Add range"
    Then the cell "Frontend / In Progress" should show the badge info icon

  @SC24
  Scenario: SC24: Add cell without show badge indicator
    When I open the settings popup
    And I enter range name "My Range"
    And I select swimlane "Frontend"
    And I select column "In Progress"
    And I leave "show indicator" unchecked
    And I click "Add range"
    Then the cell "Frontend / In Progress" should not show the badge info icon

  # === EMPTY STATE ===

  @SC25
  Scenario: SC25: Show empty table when no ranges configured
    Given there are no WIP limit settings configured
    When I open the settings popup
    Then I should see an empty ranges table with column headers
    And I should be able to add a new range
