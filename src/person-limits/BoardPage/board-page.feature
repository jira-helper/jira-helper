Feature: Personal WIP Limits on Board
  As a team member
  I want WIP limits to be applied on the board
  So that I can see who has exceeded their work in progress limits

  Background:
    Given the board is loaded
    And there are available columns:
      | id   | name        |
      | col1 | To Do       |
      | col2 | In Progress |
      | col3 | Done        |
    And there are available swimlanes:
      | id   | name       |
      | sw1  | Swimlane 1 |
      | sw2  | Swimlane 2 |

  # === DISPLAY ===

  ## No limits

  @SC-DISPLAY-1
  Scenario: SC-DISPLAY-1: No limits configured shows nothing
    Given there are no WIP limits configured
    And there are issues on the board
    When the board is displayed
    Then no WIP limit counters should be visible

  ## Single limit

  @SC-DISPLAY-2
  Scenario: SC-DISPLAY-2: Counter within limit (green)
    Given there is a WIP limit for "john.doe" with value 5 issues
    And "john.doe" has 3 issues on the board
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 5"
    And the counter for "john.doe" should be green

  @SC-DISPLAY-3
  Scenario: SC-DISPLAY-3: Counter at limit (yellow)
    Given there is a WIP limit for "john.doe" with value 3 issues
    And "john.doe" has 3 issues on the board
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 3"
    And the counter for "john.doe" should be yellow

  @SC-DISPLAY-4
  Scenario: SC-DISPLAY-4: Counter over limit (red) with highlighted cards
    Given there is a WIP limit for "jane.doe" with value 3 issues
    And "jane.doe" has 4 issues on the board
    When the board is displayed
    Then the counter for "jane.doe" should show "4 / 3"
    And the counter for "jane.doe" should be red
    And all 4 issues for "jane.doe" should be highlighted red

  @SC-DISPLAY-5
  Scenario: SC-DISPLAY-5: Person has no issues (zero count)
    Given there is a WIP limit for "john.doe" with value 5 issues
    And "john.doe" has no issues on the board
    When the board is displayed
    Then the counter for "john.doe" should show "0 / 5"
    And the counter for "john.doe" should be green

  ## Multiple limits

  @SC-DISPLAY-6
  Scenario: SC-DISPLAY-6: Multiple people with limits
    Given there is a WIP limit for "john.doe" with value 3 issues
    And there is a WIP limit for "jane.doe" with value 2 issues
    And "john.doe" has 2 issues on the board
    And "jane.doe" has 3 issues on the board
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 3"
    And the counter for "john.doe" should be green
    And the counter for "jane.doe" should show "3 / 2"
    And the counter for "jane.doe" should be red

  @SC-DISPLAY-7
  Scenario: SC-DISPLAY-7: Same person with multiple limits (different columns)
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col1"
    And there is a WIP limit for "john.doe" with value 3 issues in columns "col2"
    And "john.doe" has 1 issue in "col1"
    And "john.doe" has 4 issues in "col2"
    When the board is displayed
    Then the first counter for "john.doe" should show "1 / 2" and be green
    And the second counter for "john.doe" should show "4 / 3" and be red

  # === LIMIT SCOPE ===

  ## Column filtering

  @SC-SCOPE-1
  Scenario: SC-SCOPE-1: Limit applies to specific columns only
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col2"
    And "john.doe" has issues on the board:
      | column | swimlane |
      | col1   | sw1      |
      | col2   | sw1      |
      | col2   | sw2      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 2"
    And the counter for "john.doe" should be red
    And only 3 issues in "col2" for "john.doe" should be highlighted red

  ## Swimlane filtering

  @SC-SCOPE-2
  Scenario: SC-SCOPE-2: Limit applies to specific swimlanes only
    Given there is a WIP limit for "john.doe" with value 1 issue in swimlanes "sw1"
    And "john.doe" has issues on the board:
      | column | swimlane |
      | col2   | sw1      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "john.doe" should show "1 / 1"
    And the counter for "john.doe" should be yellow

  ## Issue type filtering

  @SC-SCOPE-3
  Scenario: SC-SCOPE-3: Limit applies to specific issue types only
    Given there is a WIP limit for "john.doe" with value 2 issues for types "Bug, Task"
    And "john.doe" has issues on the board:
      | column | swimlane | type  |
      | col2   | sw1      | Bug   |
      | col2   | sw1      | Task  |
      | col2   | sw1      | Story |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 2"
    And the counter for "john.doe" should be yellow

  ## Combined filters

  @SC-SCOPE-4
  Scenario: SC-SCOPE-4: Limit with combined filters (columns + swimlanes + types)
    Given there is a WIP limit for "john.doe" with value 2 for column "col2", swimlane "sw1" and types "Bug"
    And "john.doe" has issues on the board:
      | column | swimlane | type  |
      | col2   | sw1      | Bug   |
      | col2   | sw1      | Story |
      | col2   | sw2      | Bug   |
      | col1   | sw1      | Bug   |
    When the board is displayed
    Then the counter for "john.doe" should show "1 / 2"
    And the counter for "john.doe" should be green

  # === INTERACTION ===

  @SC-INTERACT-1
  Scenario: SC-INTERACT-1: Click avatar filters board to show only matching issues
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col2"
    And "john.doe" has issues on the board:
      | id | column | swimlane |
      | 1  | col1   | sw1      |
      | 2  | col2   | sw1      |
    And "jane.doe" has issues on the board:
      | id | column | swimlane |
      | 3  | col2   | sw1      |
    When the user clicks on "john.doe" avatar
    Then only issue "2" should be visible
    And issue "1" should be hidden
    And issue "3" should be hidden

  @SC-INTERACT-2
  Scenario: SC-INTERACT-2: Click avatar again removes filter
    Given there is a WIP limit for "john.doe" with value 2 issues
    And "john.doe" has 2 issues on the board
    And "jane.doe" has 1 issue on the board
    When the user clicks on "john.doe" avatar
    Then only "john.doe" issues should be visible
    When the user clicks on "john.doe" avatar again
    Then all issues should be visible

  @SC-INTERACT-3
  Scenario: SC-INTERACT-3: Click second limit of same person
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col1"
    And there is a second WIP limit for "john.doe" with value 1 issue in columns "col2"
    And "john.doe" has issues on the board:
      | id | column | swimlane |
      | 1  | col1   | sw1      |
      | 2  | col2   | sw1      |
    When the user clicks on the second "john.doe" avatar
    Then only issue "2" should be visible
    And issue "1" should be hidden
