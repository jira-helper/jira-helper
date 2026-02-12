Feature: WIP Limit on Cells Board Display
  As a team member
  I want to see WIP limits applied to specific board cells
  So that I can see which cell groups have exceeded their work in progress limits

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

  # === BADGE DISPLAY ===

  @SC1
  Scenario: SC1: Show badge with issue count and limit on cell with showBadge enabled
    Given there is a range "Critical Path" with WIP limit 5
    And the range has cells:
      | swimlane | column | showBadge |
      | sw1      | col2   | true      |
      | sw2      | col2   | false     |
    And there are 3 issues in cell "sw1 / col2"
    And there are 1 issues in cell "sw2 / col2"
    When the board is displayed
    Then the cell "sw1 / col2" should show a badge "4/5"
    And the cell "sw2 / col2" should not show a badge

  @SC2
  Scenario: SC2: Badge counts issues across all cells in range
    Given there is a range "Sprint Work" with WIP limit 10
    And the range has cells:
      | swimlane | column | showBadge |
      | sw1      | col2   | true      |
      | sw2      | col2   | true      |
      | sw1      | col3   | false     |
    And there are 3 issues in cell "sw1 / col2"
    And there are 4 issues in cell "sw2 / col2"
    And there are 2 issues in cell "sw1 / col3"
    When the board is displayed
    Then badges should show "9/10"

  # === COLOR INDICATORS ===

  @SC3
  Scenario: SC3: Green badge when within limit
    Given there is a range "My Range" with WIP limit 5
    And the range has a cell "sw1 / col2" with showBadge enabled
    And there are 3 issues in the range cells
    When the board is displayed
    Then the badge should have green background color "#1b855c"

  @SC4
  Scenario: SC4: Yellow badge when at limit
    Given there is a range "My Range" with WIP limit 5
    And the range has a cell "sw1 / col2" with showBadge enabled
    And there are 5 issues in the range cells
    When the board is displayed
    Then the badge should have yellow background color "#ffd700"

  @SC5
  Scenario: SC5: Red badge when exceeding limit
    Given there is a range "My Range" with WIP limit 5
    And the range has a cell "sw1 / col2" with showBadge enabled
    And there are 7 issues in the range cells
    When the board is displayed
    Then the badge should have red background color "#ff5630"

  # === CELL BACKGROUND ===

  @SC6
  Scenario: SC6: Red background on cells exceeding limit
    Given there is a range "My Range" with WIP limit 3
    And the range has cells "sw1 / col2" and "sw2 / col2"
    And there are 5 issues total in the range cells
    When the board is displayed
    Then all cells in the range should have red background overlay
    And the cells should have class "WipLimit_NotRespected"

  @SC7
  Scenario: SC7: No background change when within limit
    Given there is a range "My Range" with WIP limit 10
    And the range has cells "sw1 / col2" and "sw2 / col2"
    And there are 5 issues total in the range cells
    When the board is displayed
    Then the cells should have class "WipLimit_Respected"
    And the cells should not have red background overlay

  # === DASHED BORDERS ===

  @SC8
  Scenario: SC8: Single cell gets all four borders
    Given there is a range "Solo" with WIP limit 5
    And the range has only cell "sw1 / col2"
    When the board is displayed
    Then cell "sw1 / col2" should have dashed border on all sides (top, bottom, left, right)

  @SC9
  Scenario: SC9: Adjacent cells in same row share inner borders
    Given there is a range "Row Range" with WIP limit 10
    And the range has cells in the same swimlane:
      | swimlane | column |
      | sw1      | col2   |
      | sw1      | col3   |
    When the board is displayed
    Then cell "sw1 / col2" should have dashed border on top, bottom, and left
    And cell "sw1 / col2" should not have dashed border on right
    And cell "sw1 / col3" should have dashed border on top, bottom, and right
    And cell "sw1 / col3" should not have dashed border on left

  @SC10
  Scenario: SC10: Adjacent cells in same column share inner borders
    Given there is a range "Column Range" with WIP limit 10
    And the range has cells in the same column:
      | swimlane | column |
      | sw1      | col2   |
      | sw2      | col2   |
    When the board is displayed
    Then cell "sw1 / col2" should have dashed border on left, right, and top
    And cell "sw1 / col2" should not have dashed border on bottom
    And cell "sw2 / col2" should have dashed border on left, right, and bottom
    And cell "sw2 / col2" should not have dashed border on top

  @SC11
  Scenario: SC11: L-shaped range has correct borders
    Given there is a range "L-Shape" with WIP limit 10
    And the range has cells:
      | swimlane | column |
      | sw1      | col2   |
      | sw2      | col2   |
      | sw2      | col3   |
    When the board is displayed
    Then each cell should have dashed borders only on edges adjacent to non-range cells

  # === DISABLED RANGE ===

  @SC12
  Scenario: SC12: Disabled range shows diagonal stripe pattern
    Given there is a range "Blocked" with WIP limit 5 and disable flag set to true
    And the range has cell "sw1 / col2"
    When the board is displayed
    Then cell "sw1 / col2" should have the diagonal stripe pattern background
    And cell "sw1 / col2" should have class "WipLimitCells_disable"

  @SC13
  Scenario: SC13: Disabled range still shows borders but no limit indicators
    Given there is a range "Blocked" with WIP limit 5 and disable flag set to true
    And the range has cell "sw1 / col2"
    When the board is displayed
    Then cell "sw1 / col2" should have dashed borders
    And the cell should have the diagonal stripe pattern

  # === ISSUE TYPE FILTER ===

  @SC14
  Scenario: SC14: Count only specified issue types
    Given there is a range "Bugs Only" with WIP limit 3
    And the range has includedIssueTypes "Bug, Task"
    And the range has cell "sw1 / col2" with showBadge enabled
    And cell "sw1 / col2" contains issues:
      | type  |
      | Bug   |
      | Task  |
      | Story |
      | Bug   |
    When the board is displayed
    Then the badge should show "3/3"
    And the "Story" issue should not be counted

  @SC15
  Scenario: SC15: Count all issues when no type filter is set
    Given there is a range "All Types" with WIP limit 10
    And the range has no includedIssueTypes filter
    And the range has cell "sw1 / col2" with showBadge enabled
    And cell "sw1 / col2" contains 5 issues of mixed types
    When the board is displayed
    Then the badge should show "5/10"

  # === MULTIPLE RANGES ===

  @SC16
  Scenario: SC16: Multiple ranges displayed independently
    Given there is a range "Range A" with WIP limit 3 and cell "sw1 / col2"
    And there is a range "Range B" with WIP limit 5 and cell "sw2 / col3"
    And there are 4 issues in cell "sw1 / col2"
    And there are 2 issues in cell "sw2 / col3"
    When the board is displayed
    Then range "Range A" badge should show "4/3" with red color
    And range "Range B" badge should show "2/5" with green color
    And cell "sw1 / col2" should have red background
    And cell "sw2 / col3" should not have red background

  # === DYNAMIC UPDATE ===

  @SC17
  Scenario: SC17: Board updates when issues are moved
    Given there is a range "My Range" with WIP limit 3 and cell "sw1 / col2" with showBadge
    And there are 2 issues in cell "sw1 / col2"
    And the badge shows "2/3" with green color
    When an issue is moved into cell "sw1 / col2"
    Then the board should re-render
    And the badge should update to "3/3" with yellow color

  @SC18
  Scenario: SC18: Board updates when issues are removed
    Given there is a range "My Range" with WIP limit 3 and cell "sw1 / col2" with showBadge
    And there are 4 issues in cell "sw1 / col2"
    And the badge shows "4/3" with red color
    When an issue is moved out of cell "sw1 / col2"
    Then the board should re-render
    And the badge should update to "3/3" with yellow color

  # === CELL NOT FOUND ===

  @SC19
  Scenario: SC19: Skip cells not found on current board
    Given there is a range "Mixed" with WIP limit 5
    And the range has cells:
      | swimlane | column |
      | sw1      | col2   |
      | sw99     | col2   |
    And swimlane "sw99" does not exist on the board
    And there are 3 issues in cell "sw1 / col2"
    When the board is displayed
    Then cell "sw1 / col2" should show badge "3/5"
    And the non-existent cell should be silently skipped

  # === NO SETTINGS ===

  @SC20
  Scenario: SC20: Board shows normally when no WIP limit settings exist
    Given there are no WIP limit on cells settings configured
    When the board is displayed
    Then no WIP limit badges should be shown
    And no dashed borders should be applied
    And the board should display normally
