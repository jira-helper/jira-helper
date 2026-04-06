Feature: Person limits refactor — PropertyModel (board property)

  Загрузка и сохранение `PersonWipLimitsProperty` в Jira Board Property `PERSON_LIMITS`,
  применение `migrateProperty` при загрузке и обработка ошибок через `Result`.
  После рефакторинга поведение для пользователя и формат данных совпадают с прежними.

  # Проверки миграции и состояния property допускают тестовый harness (fixture / mock board property).

  @S10
  @SC-PROP-1
  Scenario: Migration v2.29 adds showAllPersonIssues to each limit on load
    Given board property "PERSON_LIMITS" is stored in v2.29 format without "showAllPersonIssues" on limits
    When PropertyModel loads the board property
    Then migrateProperty has applied and each limit has "showAllPersonIssues" set to true
    And the in-memory property matches the migrated shape expected by the UI

  @SC-PROP-2
  Scenario: Load returns empty limits when board property is missing
    Given board property "PERSON_LIMITS" is absent
    When PropertyModel loads the board property
    Then the loaded property has an empty limits list
    And PropertyModel exposes no load error for the user

  @SC-PROP-3
  Scenario: Load returns empty limits when board property is empty object
    Given board property "PERSON_LIMITS" exists with empty limits
    When PropertyModel loads the board property
    Then the loaded property has an empty limits list

  @SC-PROP-4
  Scenario: Persist writes the same PersonWipLimitsProperty shape as before refactor
    Given PropertyModel holds limits from user settings
    When PropertyModel persists to board property "PERSON_LIMITS"
    Then the serialized board property matches the canonical `PersonWipLimitsProperty` format
    And persist completes with Ok

  @SC-PROP-5
  Scenario: Load failure surfaces an error state instead of throwing
    Given loading board property "PERSON_LIMITS" will fail
    When PropertyModel loads the board property
    Then load completes with Err
    And PropertyModel exposes a load error the UI can show

  @SC-PROP-6
  Scenario: Persist failure surfaces an error state instead of throwing
    Given PropertyModel holds limits to save
    And updating board property "PERSON_LIMITS" will fail
    When PropertyModel persists to board property "PERSON_LIMITS"
    Then persist completes with Err
    And PropertyModel exposes a persist error the UI can show
