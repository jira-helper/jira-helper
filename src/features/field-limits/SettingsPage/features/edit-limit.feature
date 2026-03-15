Feature: Field WIP Limit Settings - Edit Limit

  Сценарии редактирования лимитов по полям доски.
  Покрывает предзаполнение формы, изменение параметров,
  добавление и снятие фильтров, смену типа подсчёта.


  Background:
    Given there are fields "Priority, Team, Component" on the board
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  # === BASIC ===

  @SC-EDIT-1
  Scenario: Edit shows current values in form
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "Pro"
    Then I see "Priority" selected in "Field" dropdown
    And I see "Cards with exact value" selected in "Calculation type" dropdown
    And I see input "Field value" has value "Pro"
    And I see input "Visual name" has value "Pro"
    And I see input "WIP Limit" has value "5"
    And the "Edit limit" button should be enabled
    And the "Add limit" button should be disabled

  @SC-EDIT-2
  Scenario: Update limit value
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "Pro"
    And I type "10" into "WIP Limit" input
    And I click "Edit limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 10 columns "all" swimlanes "all"

  @SC-EDIT-3
  Scenario: Change field value
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "Pro"
    And I type "Con" into "Field value" input
    And I click "Edit limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Con" visualName "Pro" limit 5 columns "all" swimlanes "all"

  # === ADD FILTERS ===

  @SC-EDIT-4
  Scenario: Add column filter to limit without filter
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "Pro"
    And I select "To Do" from "Columns" dropdown
    And I select "In Progress" from "Columns" dropdown
    And I click "Edit limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "To Do, In Progress" swimlanes "all"

  # === REMOVE FILTERS ===

  @SC-EDIT-5
  Scenario: Remove swimlane filter to show all
    Given a field limit: field "Team" calcType "Cards with exact value" value "Backend" visualName "Backend" limit 3 columns "all" swimlanes "Frontend"
    When I open the settings modal
    And I click "Edit" on the limit for "Backend"
    And I clear "Swimlanes" dropdown
    And I click "Edit limit"
    Then I should see limit: field "Team" calcType "Cards with exact value" value "Backend" visualName "Backend" limit 3 columns "all" swimlanes "all"

  # === VISUAL NAME ===

  @SC-EDIT-6
  Scenario: Change visual name
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "Pro"
    And I type "Professional" into "Visual name" input
    And I click "Edit limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Professional" limit 5 columns "all" swimlanes "all"

  # === BUTTON STATE ===

  @SC-EDIT-7
  Scenario: Edit limit button active only in edit mode
    Given a field limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    When I open the settings modal
    Then the "Add limit" button should be disabled
    And the "Edit limit" button should be disabled
    When I click "Edit" on the limit for "Pro"
    Then the "Add limit" button should be disabled
    And the "Edit limit" button should be enabled
