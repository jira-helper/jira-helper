Feature: Jira comment templates
  Пользователь Jira управляет шаблонами комментариев в jira-helper и вставляет их в формы комментариев без отдельного расширения.

  Background:
    Given jira-helper запущен на поддерживаемой странице Jira
    And у пользователя есть сохраненные шаблоны комментариев

  Scenario: Show template toolbar on issue view comment form
    Given пользователь открыл issue view
    When пользователь активировал inline форму комментария "#addcomment"
    Then рядом с редактором комментария отображается тулбар "Шаблоны"
    And тулбар содержит кнопки сохраненных шаблонов
    And повторные DOM-мутации не создают дубликаты тулбара

  Scenario: Show template toolbar on board detail panel comment form
    Given пользователь открыл Jira board
    And пользователь выбрал задачу в board detail panel
    When форма комментария "#addcomment" появилась в detail panel
    Then рядом с редактором комментария отображается тулбар "Шаблоны"
    And тулбар содержит кнопки сохраненных шаблонов

  Scenario: Insert template text into a Jira comment editor
    Given рядом с текущим comment editor отображается тулбар шаблонов
    When пользователь нажимает кнопку шаблона "Взял в работу"
    Then текст шаблона вставляется в текущий editor
    And вставка выполняется через PageObject текущего comment editor

  Scenario: Add template watchers after successful insertion
    Given шаблон "Взял в работу" содержит watchers "iv.petrov, aa.sidorov"
    And PageObject вернул issue key текущей задачи
    When пользователь нажимает кнопку шаблона "Взял в работу"
    Then текст шаблона вставляется в текущий editor
    And jira-helper отправляет независимые Jira REST запросы на добавление каждого watcher
    And пользователь видит уведомление о результате в правом верхнем углу
    And уведомление скрывается через 5 секунд

  Scenario: Skip watcher calls when issue key is unavailable
    Given шаблон содержит watchers
    And PageObject не смог определить issue key текущей формы комментария
    When пользователь нажимает кнопку шаблона
    Then текст шаблона вставляется в текущий editor
    And Jira REST запросы на добавление watchers не отправляются
    And пользователь видит warning о пропущенном добавлении watchers

  Scenario: Manage templates in settings UI
    Given пользователь открыл управление шаблонами
    When пользователь добавляет, редактирует и удаляет шаблоны
    And пользователь нажимает "Сохранить"
    Then шаблоны сохраняются локально
    And уже смонтированные тулбары обновляются без перезагрузки страницы

  Scenario: Reject saving an empty templates draft
    Given пользователь открыл управление шаблонами
    And пользователь удалил все шаблоны из draft
    When пользователь нажимает "Сохранить"
    Then сохранение не выполняется
    And пользователь видит validation error
    And сохраненные шаблоны не заменяются пустым списком

  Scenario: Import valid legacy JSON into settings draft
    Given пользователь открыл управление шаблонами
    When пользователь импортирует JSON массив старого расширения Jira Comment Templates
    Then импортированные шаблоны заменяют draft-список в модалке
    And данные не записываются в localStorage до нажатия "Сохранить"

  Scenario: Import current v1 JSON into settings draft
    Given пользователь открыл управление шаблонами
    And у пользователя есть JSON в формате "{ version: 1, templates }"
    When пользователь импортирует этот JSON
    Then шаблоны из payload заменяют draft-список в модалке
    And данные не записываются в localStorage до нажатия "Сохранить"

  Scenario: Preserve explicit template ids during import normalization
    Given импортируемый JSON содержит шаблон без id
    And следующий шаблон содержит явный id, похожий на сгенерированный id
    When jira-helper нормализует импортируемые шаблоны
    Then явный id существующего шаблона сохраняется
    And сгенерированный id назначается только шаблону без id или дубликату

  Scenario: Reject invalid import without corrupting saved templates
    Given пользователь открыл управление шаблонами
    And в localStorage уже есть сохраненные шаблоны
    When пользователь импортирует невалидный JSON
    Then пользователь видит понятную ошибку импорта
    And сохраненные шаблоны не изменяются

  Scenario: Fallback to defaults when stored templates payload is corrupted
    Given в localStorage лежит payload "{ version: 1, templates }"
    And массив templates содержит невалидную строку вместо объекта шаблона
    When jira-helper загружает comment templates
    Then toolbar/settings не падают
    And в памяти доступны default templates
    And corrupted storage не перезаписывается до явного save или reset

  Scenario: Export templates as JSON
    Given пользователь открыл управление шаблонами
    When пользователь нажимает экспорт
    Then браузер скачивает JSON с текущими шаблонами

  Scenario: Use default templates on first run or reset
    Given сохраненных шаблонов нет
    When jira-helper загружает comment templates
    Then доступны шаблоны "Взял в работу" и "Нужно уточнение"
    When пользователь сбрасывает настройки к умолчаниям
    Then draft или сохраненный список заменяется этими default templates

  Scenario: Transition dialog comments are outside MVP
    Given пользователь открыл workflow transition dialog с comment editor
    When jira-helper обрабатывает формы комментариев для MVP
    Then поддержка watchers в transition dialog не считается обязательным поведением
    And issue-key lookup для transition dialog остается в research task
