Feature: Field WIP Limit Settings - Add Limit

  Сценарии добавления лимитов по полям доски.
  Покрывает базовое добавление с разными типами подсчёта,
  фильтрацию по колонкам и swimlanes, валидацию и сброс формы.

  Background:
    Given there are fields "Priority, Team, Component" on the board
    And there are columns "To Do, In Progress, Done" on the board
    And there are swimlanes "Frontend, Backend" on the board

  # === EXACT VALUE ===

  @SC-ADD-1
  Scenario: Add a limit counting cards with exact value
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    And I type "5" into "WIP Limit" input
    And I click "Add limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "all" swimlanes "all"
    And I should see 1 limit in the table

  @SC-ADD-2
  Scenario: Add a limit with column filter
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    And I type "5" into "WIP Limit" input
    And I select "To Do" from "Columns" dropdown
    And I select "In Progress" from "Columns" dropdown
    And I click "Add limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Pro" limit 5 columns "To Do, In Progress" swimlanes "all"

  @SC-ADD-3
  Scenario: Add a limit with swimlane filter
    When I open the settings modal
    And I select "Team" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Backend" into "Field value" input
    And I type "3" into "WIP Limit" input
    And I select "Frontend" from "Swimlanes" dropdown
    And I click "Add limit"
    Then I should see limit: field "Team" calcType "Cards with exact value" value "Backend" visualName "Backend" limit 3 columns "all" swimlanes "Frontend"

  @SC-ADD-4
  Scenario: Add a limit with columns and swimlanes
    When I open the settings modal
    And I select "Component" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "UI" into "Field value" input
    And I type "4" into "WIP Limit" input
    And I select "To Do" from "Columns" dropdown
    And I select "In Progress" from "Columns" dropdown
    And I select "Frontend" from "Swimlanes" dropdown
    And I select "Backend" from "Swimlanes" dropdown
    And I click "Add limit"
    Then I should see limit: field "Component" calcType "Cards with exact value" value "UI" visualName "UI" limit 4 columns "To Do, In Progress" swimlanes "Frontend, Backend"

  @SC-ADD-5
  Scenario: Add a limit with visual name different from field value
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    And I type "Professional" into "Visual name" input
    And I type "5" into "WIP Limit" input
    And I click "Add limit"
    Then I should see limit: field "Priority" calcType "Cards with exact value" value "Pro" visualName "Professional" limit 5 columns "all" swimlanes "all"

  # === HAS FIELD ===

  @SC-ADD-6
  Scenario: Add a limit counting cards with filled field
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with filled field" from "Calculation type" dropdown
    And I type "Has Priority" into "Visual name" input
    And I type "10" into "WIP Limit" input
    And I click "Add limit"
    Then I should see limit: field "Priority" calcType "Cards with filled field" value "" visualName "Has Priority" limit 10 columns "all" swimlanes "all"

  @SC-ADD-7
  Scenario: Field value input is hidden for "Cards with filled field"
    When I open the settings modal
    And I select "Cards with filled field" from "Calculation type" dropdown
    Then I do not see element "[data-testid='field-value-input']"
    And I do not see element "[data-testid='field-value-tags']"

  # === MULTIPLE VALUES ===

  @SC-ADD-8
  Scenario: Add a limit matching any of multiple values
    When I open the settings modal
    And I select "Component" from "Field" dropdown
    And I select "Cards with any of values" from "Calculation type" dropdown
    And I add tag "Bug" to field values
    And I add tag "Task" to field values
    And I type "6" into "WIP Limit" input
    And I click "Add limit"
    Then I should see limit: field "Component" calcType "Cards with any of values" value "Bug, Task" visualName "Bug, Task" limit 6 columns "all" swimlanes "all"

  # === SUM NUMBERS ===

  @SC-ADD-9
  Scenario: Add a limit summing numeric field
    When I open the settings modal
    And I select "Team" from "Field" dropdown
    And I select "Sum of numeric field" from "Calculation type" dropdown
    And I type "Story Points" into "Visual name" input
    And I type "20" into "WIP Limit" input
    And I click "Add limit"
    Then I should see limit: field "Team" calcType "Sum of numeric field" value "" visualName "Story Points" limit 20 columns "all" swimlanes "all"

  @SC-ADD-10
  Scenario: Field value input is hidden for "Sum of numeric field"
    When I open the settings modal
    And I select "Sum of numeric field" from "Calculation type" dropdown
    Then I do not see element "[data-testid='field-value-input']"
    And I do not see element "[data-testid='field-value-tags']"

  # === FORM RESET ===

  @SC-ADD-11
  Scenario: Form resets after adding a limit
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    And I type "5" into "WIP Limit" input
    And I click "Add limit"
    Then I see "Cards with exact value" selected in "Calculation type" dropdown
    And I see input "Visual name" has value ""
    And I see input "WIP Limit" has value "0"

  # === VALIDATION ===

  @SC-ADD-12
  Scenario: Cannot add without selecting a field
    When I open the settings modal
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    And I type "5" into "WIP Limit" input
    Then the "Add limit" button should be disabled

  @SC-ADD-13
  Scenario: Cannot add exact value without field value
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "5" into "WIP Limit" input
    Then the "Add limit" button should be disabled

  @SC-ADD-14
  Scenario: Can add has_field without field value
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with filled field" from "Calculation type" dropdown
    And I type "5" into "WIP Limit" input
    Then the "Add limit" button should be enabled

  @SC-ADD-15
  Scenario: Cannot add with limit zero
    When I open the settings modal
    And I select "Priority" from "Field" dropdown
    And I select "Cards with exact value" from "Calculation type" dropdown
    And I type "Pro" into "Field value" input
    Then the "Add limit" button should be disabled
