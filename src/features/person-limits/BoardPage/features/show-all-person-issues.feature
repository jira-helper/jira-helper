Feature: Show all person issues on avatar click

  Per-limit option to show all person's issues or only limit-matching ones
  when clicking on person's avatar badge on the board.

  When showAllPersonIssues is true (default): clicking avatar shows all issues
  assigned to the person, regardless of column/swimlane/type filters.
  When false: only issues matching the limit criteria are shown.

  @SC-SHOW-ALL-1
  Scenario: Default behavior — show all person issues on avatar click
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     | col2    |           |            | true                |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be visible
    And issue "3" should be hidden

  @SC-SHOW-ALL-2
  Scenario: Limit-only filtering when option is disabled
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     | col2    |           |            | false               |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "2" should be visible
    And issue "1" should be hidden
    And issue "3" should be hidden

  @SC-SHOW-ALL-3
  Scenario: Toggle removes filter regardless of option
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     | col2    |           |            | true                |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be visible
    And issue "3" should be hidden
    And I click on "john.doe" avatar
    Then all issues should be visible

  @SC-SHOW-ALL-4
  Scenario: Show all with swimlane filter — ignores swimlane restriction
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     |         | sw1       |            | true                |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   | sw1      | Task      |
      | 2  | john.doe | John Doe          | col2   | sw2      | Task      |
      | 3  | jane.doe | Jane Doe          | col1   | sw1      | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be visible
    And issue "3" should be hidden

  @SC-SHOW-ALL-5
  Scenario: Limit-only with swimlane filter — respects swimlane restriction
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     |         | sw1       |            | false               |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   | sw1      | Task      |
      | 2  | john.doe | John Doe          | col2   | sw2      | Task      |
      | 3  | jane.doe | Jane Doe          | col1   | sw1      | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be hidden
    And issue "3" should be hidden

  @SC-SHOW-ALL-6
  Scenario: Show all with issueType filter — ignores issueType restriction
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     |         |           | Bug        | true                |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Bug       |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | john.doe | John Doe          | col1   |          | Story     |
      | 4  | jane.doe | Jane Doe          | col1   |          | Bug       |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be visible
    And issue "3" should be visible
    And issue "4" should be hidden

  @SC-SHOW-ALL-7
  Scenario: Two persons with different showAllPersonIssues settings
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes | showAllPersonIssues |
      | john.doe | John Doe          | 2     | col2    |           |            | true                |
      | jane.doe | Jane Doe          | 2     | col2    |           |            | false               |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | jane.doe | Jane Doe          | col1   |          | Task      |
      | 4  | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then issue "1" should be visible
    And issue "2" should be visible
    And issue "3" should be hidden
    And issue "4" should be hidden
    And I click on "john.doe" avatar
    Then all issues should be visible
    And I click on "jane.doe" avatar
    Then issue "3" should be hidden
    And issue "4" should be visible
    And issue "1" should be hidden
    And issue "2" should be hidden
