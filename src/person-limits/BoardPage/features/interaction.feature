Feature: Personal WIP Limits on Board - Interaction

  Взаимодействие с аватарами лимитов. Клик по аватару фильтрует
  доску, показывая только задачи, которые учитываются в этом лимите.
  Повторный клик снимает фильтр.

  @SC-INTERACT-1
  Scenario: Click avatar filters board to show only matching issues
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     | col2    |           |            |
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

  @SC-INTERACT-2
  Scenario: Click avatar again removes filter
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     |         |           |            |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
      | 3  | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on "john.doe" avatar
    Then only "john.doe" issues should be visible
    And I click on "john.doe" avatar
    Then all issues should be visible

  @SC-INTERACT-3
  Scenario: Click second limit of same person
    Given there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     | col1    |           |            |
      | john.doe | John Doe          | 1     | col2    |           |            |
    Given the board has issues:
      | id | person   | personDisplayName | column | swimlane | issueType |
      | 1  | john.doe | John Doe          | col1   |          | Task      |
      | 2  | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    And I click on the second "john.doe" avatar
    Then issue "2" should be visible
    And issue "1" should be hidden
