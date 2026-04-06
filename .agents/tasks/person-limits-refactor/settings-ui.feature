Feature: Person limits refactor — SettingsUIModel (CRUD, duplicates, save)

  Модалка настроек: список лимитов, форма, создание, редактирование, сохранение в board property,
  проверка дубликатов. После замены `useSettingsUIStore` на `SettingsUIModel` UX остаётся прежним.

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Step format for Then: Then I should see limit: name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  @S3
  @SC-SET-1
  Scenario: Opening settings shows existing limits and the create/edit form
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    Then I should see the Personal WIP Limits modal
    And I should see 1 limit in the table
    And I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"

  @S3
  @SC-SET-2
  Scenario: Empty limits list when property has no limits
    Given there are no limits configured
    When I open the settings modal
    Then I should see an empty limits table

  @S4
  @SC-SET-3
  Scenario: Add limit assigns a unique id and appends to the list
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "John Doe" in the limits list
    And I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    And the new limit has a unique id among listed limits

  @S5
  @SC-SET-4
  Scenario: Edit limit loads form and update persists the row
    Given a limit: login "john.doe" name "John Doe" value 3 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 7
    And I click "Update limit"
    Then I should see limit: name "John Doe" value 7 columns "all" swimlanes "all" issueTypes "all"

  @S6
  @SC-SET-5
  Scenario: Save in modal persists limits to board property
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 8
    And I click "Update limit"
    When I click "Save"
    Then limits are written to Jira Board Property "PERSON_LIMITS"
    And I do not see the modal

  @S6
  @SC-SET-6
  Scenario: Save failure shows error without silent drop
    Given a limit: login "john.doe" name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
    And saving board property "PERSON_LIMITS" will fail
    When I open the settings modal
    And I click "Edit" on the limit for "John Doe"
    And I set the limit to 8
    And I click "Update limit"
    When I click "Save"
    Then I should see that saving limits failed

  @S7
  @SC-SET-7
  Scenario: Duplicate limit is detected for same person, columns, swimlanes and issue types
    Given a limit: login "john.doe" name "John Doe" value 3 columns "To Do" swimlanes "Frontend" issueTypes "Task"
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I uncheck "All columns"
    And I select only columns "To Do"
    And I uncheck "All swimlanes"
    And I select only swimlane "Frontend"
    And I uncheck "Count all issue types"
    And I select issue types "Task"
    And I click "Add limit"
    Then I should see validation error for duplicate limit
    And I should see 1 limit in the table

  @SC-SET-8
  Scenario: SettingsUIModel duplicate check matches prior isDuplicate behaviour
    Given SettingsUIModel is initialized with limits including a fully specified limit
    When form data duplicates an existing limit on person, columns, swimlanes and issue types
    Then SettingsUIModel reports duplicate for the new row
