Feature: Apply WIP Limits on Board
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

  Scenario: Board shows cards count for a person with limit
    Given there is a WIP limit for "john.doe" with value 5 issues
    And "john.doe" has 4 issues in the board:
      | column | swimlane |
      | col1   | sw1      |
      | col1   | sw2      |
      | col2   | sw1      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "john.doe" should show "4 / 5"
    And the counter for "john.doe" should be green

  Scenario: Board highlights person exceeding limit
    Given there is a WIP limit for "jane.doe" with value 3 issues
    And "jane.doe" has 4 issues in the board:
      | column | swimlane |
      | col2   | sw1      |
      | col2   | sw1      |
      | col2   | sw2      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "jane.doe" should show "4 / 3"
    And the counter for "jane.doe" should be red
    And all 4 issues for "jane.doe" should be highlighted red

  Scenario: Board applies column-specific limits
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col2"
    And "john.doe" has issues in the board:
      | column | swimlane |
      | col1   | sw1      |
      | col2   | sw1      |
      | col2   | sw2      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 2"
    And the counter for "john.doe" should be red
    And only 3 issues in "col2" for "john.doe" should be highlighted red

  Scenario: Board applies swimlane-specific limits
    Given there is a WIP limit for "john.doe" with value 1 issue in swimlanes "sw1"
    And "john.doe" has issues in the board:
      | column | swimlane |
      | col2   | sw1      |
      | col2   | sw2      |
    When the board is displayed
    Then the counter for "john.doe" should show "1 / 1"
    And the counter for "john.doe" should be yellow

  Scenario: Board applies issue type filter
    Given there is a WIP limit for "john.doe" with value 2 issues for types "Bug, Task"
    And "john.doe" has issues in the board:
      | column | swimlane | type    |
      | col2   | sw1      | Bug     |
      | col2   | sw1      | Task    |
      | col2   | sw1      | Story   |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 2"
    And the counter for "john.doe" should be yellow

  Scenario: Filtering by clicking on avatar
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col2"
    And "john.doe" has issues in the board:
      | id | column | swimlane |
      | 1  | col1   | sw1      |
      | 2  | col2   | sw1      |
    And "jane.doe" has issues in the board:
      | id | column | swimlane |
      | 3  | col2   | sw1      |
    When the user clicks on "john.doe" avatar
    Then only issue "2" should be visible
    And issue "1" should be hidden
    And issue "3" should be hidden

  Scenario: Filtering by clicking on second limit of same person
    Given there is a WIP limit for "john.doe" with value 2 issues in columns "col1"
    And there is a second WIP limit for "john.doe" with value 1 issue in columns "col2"
    And "john.doe" has issues in the board:
      | id | column | swimlane |
      | 1  | col1   | sw1      |
      | 2  | col2   | sw1      |
    When the user clicks on the second "john.doe" avatar
    Then only issue "2" should be visible
    And issue "1" should be hidden
