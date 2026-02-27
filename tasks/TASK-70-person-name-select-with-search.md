# TASK-70: Заменить Input на Select с поиском юзеров через Jira API

**Status**: TODO

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

Сейчас поле "Person JIRA name" — обычный `<Input>`. Пользователь вводит произвольный текст,
а при сабмите `getUser(query)` молча ищет ближайшего юзера в Jira и подставляет его `name`.
Это приводит к путанице: ввёл "123", а в таблице появился "temp_aud_user".

Нужно заменить на `<Select>` с async-поиском: пользователь вводит текст → debounced запрос
к Jira API → показывается выпадающий список с найденными юзерами (имя + аватар) →
пользователь явно выбирает нужного.

Также вернуть отображение `displayName` в таблице лимитов (сейчас показывается только `name`/login).

## Текущая архитектура

```
Ввод: <Input> → свободный текст
Сабмит: SettingsModalContainer.handleAddLimit()
  → getUser(formData.personName) — прямой import из shared/jiraApi.ts
  → Jira API: user/search?query=... и user/search?username=...
  → Берёт: exactMatch → substringMatch → users[0]
  → person.name = fullPerson.name
Таблица: показывает person.name (после TASK-66)
Матчинг на доске: person.name === assignee (из avatar alt/tooltip)
```

## Целевая архитектура

```
Ввод: <Select showSearch> → async поиск
  → onSearch: debounced getUser(query) через DI
  → Показать список: avatar + displayName + name
  → При выборе: сохранить name, displayName, avatar сразу
Сабмит: НЕ вызывает getUser — данные уже есть
Таблица: показывает displayName (человекочитаемое имя)
Матчинг на доске: без изменений (person.name === assignee)
```

## Что сделать

### 1. DI для getUser

В `src/shared/di/jiraApiTokens.ts`:
- Добавить `getUserToken = new Token<GetUser>('getUser')`
- Зарегистрировать в `registerJiraApiInDI`
- Тип: `(query: string) => Promise<JiraUser[]>` (возвращать массив, а не одного)

### 2. Новый компонент PersonNameSelect

В `src/person-limits/SettingsPage/components/PersonNameSelect.tsx`:
- Ant Design `<Select>` с `showSearch`, `filterOption={false}`, `labelInValue`
- `onSearch` — debounced (300ms) вызов `getUser` через DI
- Option рендер: аватар (16x16) + displayName + name (серым)
- При выборе: сохранять `{ name, displayName, avatar }` в formData
- Поддержка начального значения (для режима Edit)
- Состояния загрузки и ошибок:
  - **Loading**: показывать спиннер в выпадающем списке пока идёт запрос
  - **Пустой результат**: показывать "No users found" если API вернул пустой массив
  - **Ошибка API**: показывать "Search failed, try again" в dropdown, не ломать форму
  - **Минимальная длина**: не отправлять запрос при длине запроса < 2 символов

### 3. Обновить PersonalWipLimitContainer

- Заменить `<Input id={settingsJiraDOM.idPersonName}>` на `<PersonNameSelect>`
- `handleFormChange('personName', value)` → сохранять объект person, а не строку
- Убрать `personName: string` из FormData, заменить на `person: { name, displayName, avatar }`

### 4. Обновить SettingsModalContainer

- Убрать `getUser()` вызов при сабмите — данные уже есть из Select
- Убрать прямой `import { getUser }` — использовать DI
- `createPersonLimit` получает person напрямую из formData

### 5. Вернуть displayName в таблицу

В `PersonalWipLimitTable.tsx`:
- `dataIndex: ['person', 'displayName']` — показывать человекочитаемое имя
- Фоллбэк на `person.name` если `displayName` отсутствует (старые данные)

### 6. Обновить тип FormData

В `src/person-limits/SettingsPage/state/types.ts`:
- `personName: string` → `person: { name: string; displayName: string; avatar: string }`
- Или добавить отдельные поля `personDisplayName`, `personAvatar`

### 7. Storybook-истории для PersonNameSelect

В `src/person-limits/SettingsPage/components/PersonNameSelect.stories.tsx`:
- Использовать Ant Design компоненты
- Мокать `getUser` через DI — подставлять задержку + фиксированные данные
- Истории:
  - **Default** — пустое начальное состояние, поиск работает
  - **WithSelectedUser** — предзаполненный юзер (режим Edit)
  - **Loading** — постоянное состояние загрузки (длинная задержка)
  - **NoResults** — поиск всегда возвращает пустой массив
  - **ApiError** — поиск всегда отклоняется с ошибкой
  - **MultipleResults** — поиск возвращает 5+ юзеров с аватарами

В `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.stories.tsx`:
- Обновить существующие истории для работы с новым `PersonNameSelect`
- Мокать `getUser` через DI

## Файлы

```
src/shared/di/jiraApiTokens.ts                    # изменение — добавить getUserToken
src/person-limits/SettingsPage/components/
├── PersonNameSelect.tsx                           # создание — новый компонент
├── PersonNameSelect.stories.tsx                   # создание — storybook истории
├── PersonalWipLimitContainer.tsx                  # изменение — заменить Input на Select
├── PersonalWipLimitContainer.stories.tsx          # изменение — обновить для нового Select
└── PersonalWipLimitTable.tsx                      # изменение — показывать displayName
src/person-limits/SettingsPage/components/SettingsModal/
└── SettingsModalContainer.tsx                     # изменение — убрать getUser, использовать DI
src/person-limits/SettingsPage/state/types.ts      # изменение — обновить FormData
```

## Критерии приёмки

- [ ] Поле "Person name" — Select с поиском (debounce 300ms)
- [ ] Выпадающий список показывает аватар + displayName + name
- [ ] При выборе юзера — в таблице отображается displayName
- [ ] `getUser` вызывается через DI (мокается в тестах)
- [ ] `getUser` НЕ вызывается при сабмите — только при поиске
- [ ] Старые данные без displayName отображаются корректно (фоллбэк на name)
- [ ] Матчинг на доске работает как прежде (по person.name)
- [ ] При загрузке показывается спиннер в dropdown
- [ ] При пустом результате — сообщение "No users found"
- [ ] При ошибке API — сообщение "Search failed, try again", форма не ломается
- [ ] Запрос не отправляется при длине < 2 символов
- [ ] Storybook-истории для PersonNameSelect: Default, WithSelectedUser, Loading, NoResults, ApiError, MultipleResults
- [ ] Storybook-истории для PersonalWipLimitContainer обновлены
- [ ] Все истории используют Ant Design компоненты
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера

## Зависимости

- Референс DI: `src/shared/di/jiraApiTokens.ts`
- Референс getUser: `src/shared/jiraApi.ts` строки 266-291
- Референс SettingsModalContainer: `src/person-limits/SettingsPage/components/SettingsModal/SettingsModalContainer.tsx` строки 43-55
- Референс PersonalWipLimitContainer: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx`
- Референс PersonalWipLimitTable: `src/person-limits/SettingsPage/components/PersonalWipLimitTable.tsx`
