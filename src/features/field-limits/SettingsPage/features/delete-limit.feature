Feature: Field WIP Limit Settings - Delete

  Сценарии удаления лимитов по полям доски.
  Покрывает удаление одного и нескольких лимитов,
  пустое состояние таблицы и отмену через Cancel.

  Background:
    Given there are fields "Priority, Team, Component" on the board
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  @SC-DEL-1
  Scenario: Delete a limit
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    Then I should not see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro"

  @SC-DEL-2
  Scenario: Delete the only limit leads to empty table
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    Then I should see an empty limits table

  @SC-DEL-3
  Scenario: Delete one of several limits
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 3 columns "To Do" swimlanes "all"
    And a field limit: field "Priority" calcType "Cards with exact value" value "Con" visualName "Con" limit 5 columns "all" swimlanes "all"
    And a field limit: field "Team" calcType "Cards with filled field" value "" visualName "Team count" limit 2 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    Then I should see 2 limits in the table
    And I should see limit: field "Priority" calcType "Cards with exact value" value "Con" visualName "Con" limit 5 columns "all" swimlanes "all"
    And I should see limit: field "Team" calcType "Cards with filled field" value "" visualName "Team count" limit 2 columns "all" swimlanes "all"
    And I should not see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro"

  @SC-DEL-4
  Scenario: Deleted limit reappears after Cancel and reopen
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    And a field limit: field "Team" calcType "Sum of numeric field" value "" visualName "SP Total" limit 20 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    And I click "Cancel"
    And I click "Edit WIP limits by field"
    Then I should see 2 limits in the table
    And I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    And I should see limit: field "Team" calcType "Sum of numeric field" value "" visualName "SP Total" limit 20 columns "all" swimlanes "all"
