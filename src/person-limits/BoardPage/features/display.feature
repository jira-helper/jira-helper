Feature: Personal WIP Limits on Board - Display

  Отображение счётчиков WIP-лимитов для пользователей на доске.
  Цвет счётчика зависит от заполненности: зелёный (в норме),
  жёлтый (на лимите), красный (превышен).

  @SC-DISPLAY-1
  Scenario: No limits configured shows nothing
    Given there are no WIP limits configured
    And there are issues on the board
    When the board is displayed
    Then no WIP limit counters should be visible

  @SC-DISPLAY-2
  Scenario: Counter within limit (green)
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 5     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 5"
    And the counter for "john.doe" should be green

  @SC-DISPLAY-3
  Scenario: Counter at limit (yellow)
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 3     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "3 / 3"
    And the counter for "john.doe" should be yellow

  @SC-DISPLAY-4
  Scenario: Counter over limit (red) with highlighted cards
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | jane.doe | Jane Doe          | 3     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "jane.doe" should show "4 / 3"
    And the counter for "jane.doe" should be red
    And all 4 issues for "jane.doe" should be highlighted red

  @SC-DISPLAY-5
  Scenario: Person has no issues (zero count)
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 5     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "0 / 5"
    And the counter for "john.doe" should be green

  @SC-DISPLAY-6
  Scenario: Multiple people with limits
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 3     |         |           |            |
      | jane.doe | Jane Doe          | 2     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 3"
    And the counter for "john.doe" should be green
    And the counter for "jane.doe" should show "3 / 2"
    And the counter for "jane.doe" should be red

  @SC-DISPLAY-7
  Scenario: Same person with multiple limits (different columns)
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     | col1    |           |            |
      | john.doe | John Doe          | 3     | col2    |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col1   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the 1st counter for "john.doe" should show "1 / 2" and be green
    And the 2nd counter for "john.doe" should show "4 / 3" and be red

  @SC-DISPLAY-8
  Scenario: Limits configured but board is empty
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 5     |         |           |            |
    When the board is displayed
    Then the counter for "john.doe" should show "0 / 5"
    And the counter for "john.doe" should be green

  @SC-DISPLAY-9
  Scenario: Swimlane filtering
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     |         | sw1       |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw2      | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 2"
    And the counter for "john.doe" should be yellow

  @SC-DISPLAY-10
  Scenario: IssueType filtering
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     |         |           | Bug        |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Bug       |
      | john.doe | John Doe          | col2   |          | Bug       |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 2"
    And the counter for "john.doe" should be yellow

  @SC-DISPLAY-11
  Scenario: DisplayName matching
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     |         |           |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | j.doe    | John Doe          | col2   |          | Task      |
      | j.doe    | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2 / 2"
    And the counter for "john.doe" should be yellow
