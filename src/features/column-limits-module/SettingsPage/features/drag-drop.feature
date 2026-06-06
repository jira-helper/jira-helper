Feature: Column Limits - Drag and Drop

  Drag-and-drop взаимодействия для перемещения колонок между группами.

  Background:
    Given I am on the Column WIP Limits settings page
    And there are columns "To Do, In Progress, Review, Done" on the board

  @SC-DND-1
  Scenario: Move column from "Without Group" to existing group
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
    When I open the settings modal
    And I drag "Review" column to group "group-1"
    Then group "group-1" should contain columns "In Progress, Review"
    And the "Without Group" section should not contain "Review"

  @SC-DND-2
  Scenario: Move column from one group to another
    Given there are configured column groups:
      | name    | columns     | limit |
      | group-1 | In Progress | 5     |
      | group-2 | Review      | 3     |
    When I open the settings modal
    And I drag "In Progress" column to group "group-2"
    Then group "group-2" should contain columns "Review, In Progress"
    And I should not see group "group-1"

  @SC-DND-3
  Scenario: Move column back to "Without Group"
    Given there are configured column groups:
      | name    | columns             | limit |
      | group-1 | In Progress, Review | 5     |
    When I open the settings modal
    And I drag "Review" column to "Without Group"
    Then the "Without Group" section should contain "Review"
    And group "group-1" should contain only "In Progress"

  @SC-DND-4
  Scenario: Dropzone highlights on drag over
    Given no column groups are configured
    When I open the settings modal
    And I start dragging "In Progress" column
    Then the dropzone should be highlighted

  @SC-DND-5
  Scenario: Dragged column shows drag preview
    Given no column groups are configured
    When I open the settings modal
    And I start dragging "In Progress" column
    Then I should see a drag preview for "In Progress"
