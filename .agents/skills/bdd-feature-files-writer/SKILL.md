---
name: bdd-feature-files-writer
description: Написание .feature файлов (Gherkin) для acceptance tests в jira-helper. Используй после написания спецификации.
---

# Написание Feature файлов

Этот skill описывает формат и процесс создания .feature файлов для acceptance tests.

## Когда использовать

- Перед реализацией фичи
- Когда нужно задокументировать acceptance criteria

## Расположение файлов

Feature файлы **разбиваются по функциональным областям** (user jobs), а не хранятся в одном большом файле:

```
src/[feature-name]/SettingsPage/features/
├── add-limit.feature           # Сценарии добавления
├── edit-limit.feature          # Сценарии редактирования
├── delete-limit.feature        # Сценарии удаления
├── modal-lifecycle.feature     # Открытие/закрытие модалки
├── person-search.feature       # Поиск пользователей
├── steps/
│   └── common.steps.ts         # Общие step definitions
├── helpers.tsx                 # Фикстуры и mount helpers
├── add-limit.feature.cy.tsx    # Cypress тесты
├── edit-limit.feature.cy.tsx
└── ...
```

**Преимущества разбиения:**
- Легче навигация и поддержка
- Параллельный запуск тестов
- Изолированные изменения без конфликтов
- Переиспользование степов между файлами

---

## Структура .feature файла

```gherkin
Feature: [Название фичи] - [Функциональная область]

  Краткое описание что делает эта группа сценариев.
  Например: управление персональными WIP-лимитами,
  добавление новых лимитов с фильтрами по колонкам и свимлейнам.

  # Step format for Given: Given a limit: login "X" name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Step format for Then: Then I should see limit: name "Y" value N columns "A,B" swimlanes "C,D" issueTypes "E,F"
  # Use "all" for columns/swimlanes/issueTypes to mean no filter

  @SC-ADD-1
  Scenario: Add a new limit for a person
    When I open the settings modal
    And I search for "john" in person name field
    And I select "John Doe (john.doe)" from search results
    And I set the limit to 5
    And I click "Add limit"
    Then I should see "John Doe" in the limits list
    And I should see limit: name "John Doe" value 5 columns "all" swimlanes "all" issueTypes "all"
```

### Описание Feature (обязательно)

После строки `Feature:` добавляй **2-3 строки описания** что делает эта группа сценариев:

```gherkin
Feature: Personal WIP Limit Settings - Add Limit

  Сценарии добавления персональных WIP-лимитов.
  Покрывает базовое добавление, фильтрацию по колонкам/свимлейнам/типам задач,
  валидацию и сброс формы после добавления.
```

Gherkin разрешает произвольный текст между `Feature:` и первым `Scenario:`.

---

## Правила написания

### 1. Используй Семантические ID сценариев с префиксом группы в тегах

```gherkin
@SC-ADD-1
Scenario: Add a new limit for a person
```

### 2. Background — только если действительно общий

Используй Background только когда **все** сценарии в файле требуют одинаковых предусловий.
Иначе — явные Given степы в каждом сценарии.

```gherkin
# ✅ ХОРОШО: Background для общих данных
Background:
  Given there are columns "To Do, In Progress, Done" on the board
  And there are swimlanes "Frontend, Backend" on the board

# ❌ ПЛОХО: Background с действием которое не всем нужно
Background:
  Given I open the settings modal  # Не все сценарии начинаются с открытой модалки!
```

## Best Practices для степов

### 1. Использовать глобальные степы по возможности
Глобальные степы расположены тут `cypress/support/gherkin-steps/common.ts`

### 2. Универсальные степы

Степы должны быть **переиспользуемыми** между сценариями и файлами.

### 3. UI-first проверки

Then-степы должны проверять через **UI**, а не только через store:

```gherkin
# ✅ ХОРОШО: проверка через UI
Then I should see "John Doe" in the limits list
Then the limit field should show value 5
Then checkbox "All columns" should be checked

# ❌ ПЛОХО: проверка только состояния (не видна пользователю)
Then the store should have 3 limits
Then the form state should be "editing"
```

**Исключение:** Given степы могут работать со store напрямую для настройки начального состояния.

### 3. Атомарные действия

Один степ = одно действие:

```gherkin
# ✅ ХОРОШО: атомарные степы
When I search for "john" in person name field
And I select "John Doe (john.doe)" from search results

# ❌ ПЛОХО: несколько действий в одном степе
When I search for "john" and select "John Doe"
```

### 4. Читаемые параметры

Используй кавычки для строк, без кавычек для чисел:

```gherkin
# ✅ ХОРОШО
When I set the limit to 5
And I select only columns "To Do, In Progress"
Then I should see "John Doe" in the limits list

# ❌ ПЛОХО
When I set the limit to "5"
And I select only columns To Do, In Progress
```
### 5. Не дублируй бизнес-логику в степах

Степ должен описывать **что** делает пользователь, а не **как** это реализовано:

```gherkin
# ✅ ХОРОШО: что делает пользователь
When I click "Add limit"
Then I should see "John Doe" in the limits list

# ❌ ПЛОХО: детали реализации
When I trigger the handleSubmit callback
Then the store.data.limits array should have length 1
```

---

## Стандартные паттерны степов

| Паттерн | Пример |
|---------|--------|
| Открытие модалки | `When I open the settings modal` |
| Поиск | `When I search for "john" in person name field` |
| Выбор из списка | `And I select "John Doe (john.doe)" from search results` |
| Установка значения | `And I set the limit to 5` |
| Клик по кнопке | `And I click "Add limit"` |
| Чекбокс | `And I uncheck "All columns"` / `And I check "All swimlanes"` |
| Выбор опций | `And I select only columns "To Do, In Progress"` |
| Проверка в списке | `Then I should see "John Doe" in the limits list` |
| Проверка отсутствия | `Then "John Doe" should not be in the limits list` |
| Проверка количества | `Then I should see 3 limits in the table` |
| Проверка значения | `Then the limit field should show value 5` |
| Проверка чекбокса | `Then checkbox "All columns" should be checked` |
| Комплексная проверка | `Then I should see limit: name "X" value N columns "A" swimlanes "B" issueTypes "C"` |

---

## Чек-лист

- [ ] Feature файл разбит по функциональной области (add, edit, delete, etc.)
- [ ] Есть описание Feature (2-3 строки после `Feature:`)
- [ ] Семантические (@SC-ADD-1, @SC-EDIT-1, ...) ID сценариев в тегах
- [ ] Background только для действительно общих предусловий
- [ ] По возможности используются глобальные степы
- [ ] Степы универсальные и переиспользуемые
- [ ] Then-степы проверяют через UI
- [ ] Атомарные действия (один степ = одно действие)
- [ ] Покрыты CRUD операции
- [ ] Покрыта валидация
- [ ] Покрыты edge cases (duplicates, empty state)
- [ ] Сценарии читаемы без знания кода

---

## Референс

См. `src/person-limits/SettingsPage/features/` как пример структуры.
