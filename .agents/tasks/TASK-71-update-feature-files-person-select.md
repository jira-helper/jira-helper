# TASK-71: Обновить feature файлы для PersonNameSelect

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

**Блокирует**: [TASK-70](./TASK-70-person-name-select-with-search.md)

---

## Описание

Перед реализацией TASK-70 (замена Input на Select с поиском) — обновить `.feature` файл
с описанием сценариев, чтобы они отражали новое поведение компонента.

Сначала фиче-файлы, потом код. Требует ручного ревью перед началом имплементации.

## Что изменилось

Сейчас в сценариях:
- `When I enter person name "john.doe"` — свободный текстовый ввод
- В таблице показывается `name` (логин)
- Нет сценариев для поиска, выбора из списка, ошибок поиска

Нужно:
- Заменить "enter person name" на поиск + выбор из выпадающего списка
- Добавить отображение `displayName` в таблице (с фоллбэком на `name`)
- Добавить сценарии для: загрузка, пустой результат, ошибка API

## Новые/изменённые сценарии

### Изменить существующие

Во всех сценариях где есть `When I enter person name "..."`:
- Заменить на `When I search for "..." in person name field` + `And I select "Display Name (login)" from search results`
- В таблице: `Then I should see "John Doe" in the limits list` (displayName вместо name)

### Новые сценарии: Person search

```gherkin
# === PERSON SEARCH ===

@SC-SEARCH-1
Scenario: SC-SEARCH-1: Search shows matching users with avatars
  When I type "john" in person name field
  Then I should see a dropdown with matching users
  And each option should show avatar, display name and login

@SC-SEARCH-2
Scenario: SC-SEARCH-2: Search debounces API calls
  When I type "j" in person name field
  Then I should not see a dropdown (min 2 characters)
  When I type "jo" in person name field
  Then I should see a loading indicator
  And then I should see search results

@SC-SEARCH-3
Scenario: SC-SEARCH-3: No users found
  When I search for "zzzznonexistent" in person name field
  Then I should see "No users found" in the dropdown

@SC-SEARCH-4
Scenario: SC-SEARCH-4: API error during search
  Given the user search API will fail
  When I search for "john" in person name field
  Then I should see "Search failed, try again" in the dropdown
  And the form should remain functional

@SC-SEARCH-5
Scenario: SC-SEARCH-5: Select user from search results
  When I search for "john" in person name field
  And I select "John Doe (john.doe)" from search results
  Then I should see "John Doe" as selected person
  And the limit form should be ready to submit

@SC-SEARCH-6
Scenario: SC-SEARCH-6: Edit mode shows current person in select
  Given there is a limit for "john.doe" (John Doe) with value 5
  When I click "Edit" on the limit for "John Doe"
  Then the person select should show "John Doe (john.doe)"
```

### Изменить отображение в таблице

```gherkin
# В SC-MODAL-2 и других сценариях с таблицей:
# Было:  I should see limit for "alice" with value 3
# Стало: I should see limit for "Alice Smith" with value 3

# В SC-ADD-1:
# Было:  Then I should see "john.doe" in the limits list
# Стало: Then I should see "John Doe" in the limits list
```

## Файлы

```
src/person-limits/SettingsPage/SettingsPage.feature    # изменение
```

## Критерии приёмки

- [ ] Все сценарии с "enter person name" заменены на search + select
- [ ] Таблица отображает displayName
- [ ] Добавлены сценарии SC-SEARCH-1..SC-SEARCH-6
- [ ] Feature файл прошёл ручное ревью
- [ ] `node scripts/validate-feature-tests.mjs` — пройдёт после реализации TASK-70

## Процесс

1. Обновить `.feature` файл
2. **Ручное ревью** (обязательно перед продолжением)
3. После ревью — приступить к TASK-70 (имплементация)
