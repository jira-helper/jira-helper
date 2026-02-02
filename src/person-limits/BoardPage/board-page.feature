Feature: Apply WIP Limits on Board
  As a team member
  I want WIP limits to be applied on the board
  So that I can see who has exceeded their work in progress limits

  Background:
    Given the board is loaded
    And there are available columns "To Do, In Progress, Done"

  Scenario: Board shows cards count for a person with limit
    Given there is a WIP limit for "john.doe" with value 5 issues
    And "john.doe" has 4 issues in the board
    When the board is displayed
    Then the counter for "john.doe" should show "4 / 5"
    And the counter should be green (within limit)

  Scenario: Board highlights person exceeding limit
    Given there is a WIP limit for "jane.doe" with value 3 issues
    And "jane.doe" has 5 issues in the board
    When the board is displayed
    Then the counter for "jane.doe" should show "5 / 3"
    And the counter should be red (exceeded limit)

  Scenario: Board applies column-specific limits
    Given there is a WIP limit for "john.doe" limited to column "In Progress" with value 2
    And "john.doe" has 1 issue in "To Do"
    And "john.doe" has 3 issues in "In Progress"
    When the board is displayed
    Then only issues in "In Progress" are counted for the limit
    And the counter should show "3 / 2"
