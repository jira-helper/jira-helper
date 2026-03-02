Feature: Column Group WIP Limits - Swimlane Filtering

  Фильтрация задач по свимлейнам для групп колонок.
  WIP лимиты считают только задачи из выбранных свимлейнов.
  Пустой выбор = все свимлейны.

  Background:
    Given the board has columns:
      | name        |
      | In Progress |
      | Review      |
    And the board has swimlanes:
      | name     |
      | Frontend |
      | Backend  |
      | Expedite |

  @SC-SWIM-BOARD-1
  Scenario: Count issues only from selected swimlanes
    Given there are column groups:
      | name | columns     | limit | swimlanes         |
      | Dev  | In Progress | 1     | Frontend, Backend |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Backend  |
      | In Progress | Expedite |
    When the board is displayed
    Then the badge on "In Progress" should show "2/1"
    And "In Progress" cells should have red background

  @SC-SWIM-BOARD-2
  Scenario: All swimlanes when empty selection
    Given there are column groups:
      | name | columns     | limit | swimlanes |
      | Dev  | In Progress | 3     |           |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Backend  |
      | In Progress | Expedite |
    When the board is displayed
    Then the badge on "In Progress" should show "3/3"

  @SC-SWIM-BOARD-3
  Scenario: Different swimlanes for different groups
    Given there are column groups:
      | name     | columns     | limit | swimlanes |
      | Frontend | In Progress | 2     | Frontend  |
      | Backend  | Review      | 1     | Backend   |
    And the board has issues:
      | column      | swimlane |
      | In Progress | Frontend |
      | In Progress | Frontend |
      | Review      | Backend  |
    When the board is displayed
    Then the badge on "In Progress" should show "2/2"
    And the badge on "Review" should show "1/1"
