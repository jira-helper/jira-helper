Feature: Personal WIP Limits on Board - Swimlane Strategy

  # Jira's editmodel returns saved query swimlanes regardless of the active strategy.
  # When the board's swimlaneStrategy is not "custom", those entries don't exist in the DOM,
  # and any limit that references them (e.g. saved earlier when the board was "custom")
  # would silently match nothing. The runtime must ignore the swimlane filter in that case.

  @SC-SWIM-RT-1
  Scenario: Limit with stale swimlanes still counts on a non-custom-swimlane board
    Given the board swimlane strategy is not custom
    And there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 5     |         | sw1       |            |
    And the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
      | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "3/5"
    And the counter for "john.doe" should be green

  @SC-SWIM-RT-2
  Scenario: Limit with stale swimlanes triggers over-limit highlight on a non-custom-swimlane board
    Given the board swimlane strategy is not custom
    And there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes  | issueTypes |
      | jane.doe | Jane Doe          | 2     |         | sw1,sw2    |            |
    And the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
      | jane.doe | Jane Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "jane.doe" should show "3/2"
    And the counter for "jane.doe" should be red
    And all 3 issues for "jane.doe" should be highlighted red

  @SC-SWIM-RT-3
  Scenario: Other filters (columns, issueTypes) keep working when swimlane filter is ignored
    Given the board swimlane strategy is not custom
    And there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 2     | col2    | sw1       | Bug        |
    And the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   |          | Bug       |
      | john.doe | John Doe          | col2   |          | Bug       |
      | john.doe | John Doe          | col1   |          | Bug       |
      | john.doe | John Doe          | col2   |          | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2/2"
    And the counter for "john.doe" should be yellow

  @SC-SWIM-RT-4
  Scenario: With custom swimlane strategy, saved swimlane filter is still respected
    # Regression guard: the fix must not change behavior on real custom-swimlane boards.
    Given the board swimlane strategy is custom
    And there are WIP limits:
      | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
      | john.doe | John Doe          | 5     |         | sw1       |            |
    And the board has issues:
      | person   | personDisplayName | column | swimlane | issueType |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw1      | Task      |
      | john.doe | John Doe          | col2   | sw2      | Task      |
    When the board is displayed
    Then the counter for "john.doe" should show "2/5"
    And the counter for "john.doe" should be green
