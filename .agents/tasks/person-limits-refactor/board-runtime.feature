Feature: Person limits refactor — BoardRuntimeModel (stats, highlight, filter)

  Подсчёт issue по лимитам, бейджи `N/M`, подсветка превышения лимита и фильтрация по клику на аватар.
  Поведение на доске после замены runtime store на `BoardRuntimeModel` не меняется.

  # Степы согласованы с `BoardPage/features/display.feature` и `interaction.feature`.

  @S1
  @SC-BRD-1
  Scenario: Board shows avatars with N/M badges and highlights issues over limit
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
    Then the counter for "jane.doe" should show "4/3"
    And the counter for "jane.doe" should be red
    And all 4 issues for "jane.doe" should be highlighted red

  @S9
  @SC-BRD-2
  Scenario: No board property — feature does not show avatars or apply person-limit styles
    Given there are no WIP limits configured
    And there are issues on the board
    When the board is displayed
    Then no WIP limit counters should be visible
    And no person-limit highlight styles are applied to issues

  @S2
  @SC-BRD-3
  Scenario: Click avatar filters to that person’s issues; second click clears filter
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
    When I click on "john.doe" avatar
    Then all issues should be visible

  @S2
  @SC-BRD-4
  Scenario: With showAllPersonIssues true, click avatar shows all tasks of that person
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

  @S2
  @SC-BRD-5
  Scenario: Empty swimlanes and parent groups stay hidden when filtering
    Given a board layout where some swimlanes or parent groups have no visible issues after filtering
    When I click on a limit avatar to filter
    Then swimlanes with no visible issues are hidden
    And parent groups with no visible issues are hidden

  @S8
  @SC-BRD-6
  Scenario: Swimlane-aware stats count only issues in selected swimlanes for that limit
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     |         | sw1       |            |
    Given the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw2      | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2/2"
    And the counter for "john.doe" should be yellow
