Feature: Field WIP Limit Settings - Modal Lifecycle

  Сценарии открытия и закрытия модалки настроек Field WIP Limits.
  Покрывает пустое состояние, предзаполненные лимиты,
  сохранение и отмену изменений.

  Background:
    Given there are fields "Priority, Team, Component" on the board
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  @SC-MODAL-1
  Scenario: Open modal with empty state and default form
    Given there are no field limits configured
    When I open the settings modal
    Then I see the modal "Field WIP Limits"
    And I should see an empty limits table
    And I see "Cards with exact value" selected in "Calculation type" dropdown
    And I see input "Visual name" has value ""
    And I see input "WIP Limit" has value "0"
    When I click "OK" button
    Then I do not see the modal

  @SC-MODAL-2
  Scenario: Open modal with pre-configured limits
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 3 columns "all" swimlanes "all"
    And a field limit: field "Team" calcType "Cards with filled field" value "" visualName "Team count" limit 5 columns "To Do, In Progress" swimlanes "all"
    And a field limit: field "Component" calcType "Sum of numeric field" value "" visualName "SP Total" limit 20 columns "all" swimlanes "Frontend"
    When I open the settings modal
    Then I see the modal "Field WIP Limits"
    And I should see 3 limits in the table
    And I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 3 columns "all" swimlanes "all"
    And I should see limit: field "Team" calcType "Cards with filled field" value "" visualName "Team count" limit 5 columns "To Do, In Progress" swimlanes "all"
    And I should see limit: field "Component" calcType "Sum of numeric field" value "" visualName "SP Total" limit 20 columns "all" swimlanes "Frontend"

  @SC-MODAL-3
  Scenario: Save closes modal and persists changes
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I select "Team" from "Field" dropdown
    And I select "Cards with filled field" from "Calculation type" dropdown
    And I type "Team count" into "Visual name" input
    And I type "3" into "WIP Limit" input
    And I click "Add limit"
    And I click "OK" button
    Then I do not see the modal
    When I click "Edit WIP limits by field"
    Then I should see 2 limits in the table
    And I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    And I should see limit: field "Team" calcType "Cards with filled field" value "" visualName "Team count" limit 3 columns "all" swimlanes "all"

  @SC-MODAL-4
  Scenario: Cancel discards changes and closes modal
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    And I click "Cancel"
    Then I do not see the modal

  @SC-MODAL-5
  Scenario: Reopen after Cancel shows unchanged data
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Delete" on the limit for "Pro"
    And I click "Cancel"
    And I click "Edit WIP limits by field"
    Then I should see 1 limit in the table
    And I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
