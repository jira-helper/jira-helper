Feature: Person limits refactor — DI module, tokens, useModel

  Регистрация `PersonLimitsModule` в контейнере, токены трёх Model-ов и подписка контейнеров через `useModel`.
  Эти сценарии фиксируют архитектурный контракт рефакторинга; проверки выполняются в component/integration тестах с тестовым DI-контейнером.

  @SC-DI-1
  Scenario: PersonLimitsModule registers PropertyModel, BoardRuntimeModel and SettingsUIModel
    Given a DI container configured for the extension
    When personLimitsModule.ensure is applied to the container
    Then propertyModelToken resolves to a PropertyModel instance
    And boardRuntimeModelToken resolves to a BoardRuntimeModel instance
    And settingsUIModelToken resolves to a SettingsUIModel instance

  @SC-DI-2
  Scenario: Model tokens resolve via lazy registration without eager side effects
    Given personLimitsModule.ensure has been applied to the container
    When models are first resolved from their tokens
    Then each model is constructed through the module’s lazy factory

  @SC-DI-3
  Scenario: BoardRuntimeModel receives PropertyModel and BoardPagePageObject via constructor DI
    Given personLimitsModule.ensure has been applied to the container
    When boardRuntimeModelToken is resolved
    Then BoardRuntimeModel was constructed with PropertyModel from propertyModelToken
    And BoardRuntimeModel was constructed with BoardPagePageObject from board page object token

  @SC-DI-4
  Scenario: SettingsUIModel receives PropertyModel via constructor DI
    Given personLimitsModule.ensure has been applied to the container
    When settingsUIModelToken is resolved
    Then SettingsUIModel was constructed with PropertyModel from propertyModelToken

  @SC-DI-5
  Scenario: AvatarsContainer uses BoardRuntimeModel through useModel
    Given personLimitsModule.ensure has been applied to the container
    When AvatarsContainer mounts with the test container
    Then AvatarsContainer subscribes to board runtime state via useModel with boardRuntimeModelToken

  @SC-DI-6
  Scenario: Settings containers use SettingsUIModel through useModel
    Given personLimitsModule.ensure has been applied to the container
    When SettingsButtonContainer mounts with the test container
    Then SettingsButtonContainer subscribes to settings UI state via useModel with settingsUIModelToken
    When SettingsModalContainer mounts with the test container
    Then SettingsModalContainer subscribes to settings UI state via useModel with settingsUIModelToken
    When PersonalWipLimitContainer mounts with the test container
    Then PersonalWipLimitContainer subscribes to settings UI state via useModel with settingsUIModelToken

  @SC-DI-7
  Scenario: content.ts ensures person limits module on the shared container
    Given the extension content bootstrap runs
    Then personLimitsModule.ensure is registered for the application container like other feature modules
