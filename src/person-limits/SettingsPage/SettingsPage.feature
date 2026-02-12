Feature: Personal WIP Limit Settings
  As a team lead
  I want to manage personal WIP limits for team members
  So that I can control workload distribution

  Background:
    Given I am on the Personal WIP Limits settings page
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  # === ADD LIMIT ===

  @SC1
  Scenario: SC1: Add a new limit for a person
    When I enter person name "john.doe"
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "john.doe" in the limits list
    And the limit should show value 5

  @SC2
  Scenario: SC2: Add a limit for specific columns only
    When I enter person name "jane.doe"
    And I set the limit to 3
    And I select only columns "To Do, In Progress"
    And I click "Add limit"
    Then the limit for "jane.doe" should apply only to "To Do, In Progress"

  # === EDIT LIMIT ===

  @SC3
  Scenario: SC3: Edit an existing limit
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    Then I should see "john.doe" in the person name field
    And I should see 5 in the limit field
    And the button should show "Edit limit"

  @SC4
  Scenario: SC4: Update limit value
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I change the limit to 10
    And I click "Edit limit"
    Then the limit for "john.doe" should show value 10

  # === DELETE LIMIT ===

  @SC5
  Scenario: SC5: Delete a limit
    Given there is a limit for "john.doe"
    When I click "Delete" on the limit for "john.doe"
    Then "john.doe" should not be in the limits list

  # === MASS OPERATIONS ===

  @SC6
  Scenario: SC6: Apply columns to multiple limits at once
    Given there are limits for "john.doe" and "jane.doe"
    When I select both limits
    And I click "Apply columns for selected users"
    And I choose only column "To Do"
    Then both limits should apply only to "To Do"

  # === SWIMLANES ===

  @SC7
  Scenario: SC7: Add a limit for specific swimlanes only
    When I enter person name "john.doe"
    And I set the limit to 5
    And I select only swimlane "Frontend"
    And I click "Add limit"
    Then the limit for "john.doe" should apply only to swimlane "Frontend"

  @SC8
  Scenario: SC8: Apply swimlanes to multiple limits at once
    Given there are limits for "john.doe" and "jane.doe"
    When I select both limits
    And I click "Apply swimlanes for selected users"
    And I choose only swimlane "Backend"
    Then both limits should apply only to swimlane "Backend"

  # === ISSUE TYPES ===

  @SC9
  Scenario: SC9: Add a limit for specific issue types only
    When I enter person name "john.doe"
    And I set the limit to 3
    And I uncheck "Count all issue types"
    And I select issue types "Task, Bug"
    And I click "Add limit"
    Then the limit for "john.doe" should count only "Task, Bug" issues

  @SC10
  Scenario: SC10: Edit limit preserves issue type filter
    Given there is a limit for "john.doe" with issue types "Task, Bug"
    When I click "Edit" on the limit for "john.doe"
    Then issue types "Task, Bug" should be selected
    And "Count all issue types" should be unchecked

  # === VALIDATION ===

  @SC11
  Scenario: SC11: Cannot add limit without person name
    When I set the limit to 5
    And I click "Add limit"
    Then I should see a validation error for person name

  @SC12
  Scenario: SC12: Cannot add limit with zero value
    When I enter person name "john.doe"
    And I leave limit as 0
    And I click "Add limit"
    Then I should see a validation error for limit value

  # === CANCEL EDIT ===

  @SC13
  Scenario: SC13: Cancel editing returns to add mode
    Given there is a limit for "john.doe" with value 5
    When I click "Edit" on the limit for "john.doe"
    And I change the limit to 10
    And I click somewhere else to cancel
    Then the button should show "Add limit"
    And the limit for "john.doe" should still show value 5

  # === EMPTY STATE ===

  @SC14
  Scenario: SC14: Show empty state when no limits exist
    Given there are no limits configured
    Then I should see an empty limits table
    And I should see the avatar warning message

  # === MULTIPLE LIMITS PER PERSON ===

  @SC15
  Scenario: SC15: Add multiple limits for same person with different columns
    Given there is a limit for "john.doe" with value 3 for column "To Do"
    When I enter person name "john.doe"
    And I set the limit to 5
    And I select only column "In Progress"
    And I click "Add limit"
    Then I should see two limits for "john.doe"
    And one limit should show value 3 for "To Do"
    And another limit should show value 5 for "In Progress"
