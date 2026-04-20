# Requirements: Поддержка Jira Cloud — person-limits

**Feature folder**: `.agents/tasks/jira-cloud-support/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-04-07
**Статус**: agreed

## 1. Цель и мотивация

Перенести фичу person-limits (персональные WIP-лимиты) на Jira Cloud (Company-managed) с минимальными изменениями внутри модуля. Cloud-специфика закрывается на уровне DI-токенов и точки входа.

**Критерий успеха**: person-limits работает на Cloud-доске — аватары с WIP-подсчётом, подсветка карточек, настройка через вкладку на доске.

**Тип**: расширение существующей фичи на новое окружение.

## 2. Пользователи и контекст

- **Роли**: пользователь с доступом к Kanban/Scrum доске в Jira Cloud (Company-managed).
- **Страницы Jira**:
  - Board page — отображение лимитов, подсветка, аватары, вкладка настроек.
- **Точки входа**:
  - Автоматическое применение на Board page.
  - Настройки через вкладку jira-helper settings на доске (механизм `registerSettings` → `BoardSettingsComponent`).

### Что НЕ входит в скоуп

- **SettingsPage** (страница настроек доски `?config=columns`) — НЕ модифицируем для Cloud, не нужно.
- **column-limits** — отдельная итерация.

## 3. Техническое ограничение: Cloud API

**Jira Cloud использует другое API.** Все DI-токены, которые транзитивно зависят от Jira REST API, потенциально требуют Cloud-адаптации. Это касается не только эндпоинтов, но и формата данных (Cloud использует `accountId` вместо `username`/`name`, другие URL аватаров, возможно другой формат ответов).

Правило: **всё, что обращается к Jira API, должно быть проверено и при необходимости заменено для Cloud через DI.**

## 4. Анализ DI-зависимостей person-limits

### 4.1 Внутренние токены модуля (НЕ меняются)

| Токен | Тип | Файл |
|-------|-----|------|
| `propertyModelToken` | `ModelEntry<PropertyModel>` | `tokens.ts` |
| `boardRuntimeModelToken` | `ModelEntry<BoardRuntimeModel>` | `tokens.ts` |
| `settingsUIModelToken` | `ModelEntry<SettingsUIModel>` | `tokens.ts` |

### 4.2 Внешние DI-токены — зависят от DOM (нужна Cloud PageObject)

| Токен | Используется в | Методы, используемые person-limits | Cloud-адаптация |
|-------|---------------|--------|-----------------|
| `boardPagePageObjectToken` | `BoardRuntimeModel`, `PersonLimitsBoardPage` | `getColumnIdFromColumn`, `getIssueElementsInColumn`, `getAssigneeFromIssue`, `getIssueTypeFromIssue`, `hasCustomSwimlanes`, `getSwimlanes`, `getColumnsInSwimlane`, `getColumnElements`, `getParentGroups`, `countIssueVisibility`, `setParentGroupVisibility`, `getIssueElements`, `setIssueVisibility`, `getColumnIdOfIssue`, `getSwimlaneIdOfIssue`, `setSwimlaneVisibility`, `resetIssueBackgroundColor`, `setIssueBackgroundColor`, `selectors.*` | **Cloud-реализация** — другая DOM-структура (`data-test-id` вместо `ghx-*`) |

### 4.3 Внешние DI-токены — зависят от Jira API (нужна Cloud-адаптация)

| Токен | API endpoint | Проблема для Cloud |
|-------|-------------|-------------------|
| `getBoardPropertyToken` | `agile/1.0/board/{id}/properties/{key}` GET | Endpoint совпадает, но HTTP-клиент (`@tinkoff/request-*`) и формат ответа нужно проверить |
| `updateBoardPropertyToken` | `agile/1.0/board/{id}/properties/{key}` PUT | То же |
| `deleteBoardPropertyToken` | `agile/1.0/board/{id}/properties/{key}` DELETE | То же |
| `BoardPropertyServiceToken` | Обёртка над `get/update/deleteBoardPropertyToken` | Транзитивно зависит от API-токенов выше |
| `getBoardEditDataToken` | `greenhopper/1.0/rapidviewconfig/editmodel.json` | **Server-only endpoint.** В Cloud скорее всего недоступен, нужна альтернатива (Agile REST API) |
| `searchUsersToken` | `api/2/user/search` с `query`/`username` | Cloud использует `accountId` вместо `name`, формат ответа может отличаться |
| `buildAvatarUrlToken` | Генерирует `/secure/useravatar?username=...` | **Server-only формат.** Cloud использует URL из `avatarUrls` ответа API |
| `getProjectIssueTypesToken` | `api/2/project/{key}` | Может работать, формат ответа проверить |

### 4.4 Внешние DI-токены — НЕ зависят от API (работают как есть)

| Токен | Почему OK |
|-------|----------|
| `loggerToken` | Чистая утилита, нет API |
| `routingServiceToken` | Парсит URL, уже поддерживает Cloud паттерны |
| `localeProviderToken` | Читает DOM-атрибуты (TBD для Cloud, fallback `'en'`) |

### 4.5 Переиспользование PageModification

Server-специфичные места в `PersonLimitsBoardPage`:

| Место | Server-код | Решение |
|-------|-----------|---------|
| `waitForLoading()` | `.ghx-column, .ghx-swimlane` | Использовать `po.selectors.column`, `po.selectors.swimlaneRow` |
| `appendStyles()` | `.ghx-issue.no-visibility` и т.д. | Упростить до `.no-visibility { display: none !important }` — наш класс, не зависит от DOM Jira |
| `renderAvatarsContainer()` | `#subnav-title` | Новый селектор `po.selectors.boardHeaderTarget` |
| `onDOMChange()` | `#ghx-pool` | Использовать `po.selectors.pool` |
| `getCssSelectorOfIssues()` | `.ghx-issue:not(.ghx-issue-subtask)` | Новый метод `po.getIssueCssSelector(editData)` |

**Результат**: `PersonLimitsBoardPage` остаётся один класс, работает для Server и Cloud. Разница — в зарегистрированном PageObject.

### 4.6 Механизм вставки настроек (registerSettings)

Текущий flow:
1. `PersonLimitsBoardPage.apply()` → `registerSettings({ title, component })` → Zustand store
2. `BoardSettingsBoardPage` → рендерит иконку jira-helper → модалка с вкладками
3. `BoardSettingsBoardPage.waitForLoading()` ждёт `BoardPagePageObject.selectors.sidebar`
4. Вставляет `BoardSettingsComponent` через `sidebar.after(div)`

**Для Cloud**: `BoardSettingsBoardPage` тоже нужно параметризовать через PageObject (использовать `po.selectors.sidebar`). Zustand store + `BoardSettingsComponent` + `PersonLimitsSettingsTab` — переиспользуются без изменений.

## 5. Функциональные требования

### FR-1: Отдельная точка входа для Cloud

- Новый файл `src/content-cloud.ts` + паттерн `*://*.atlassian.net/*` в manifest.
- Регистрирует `jiraEnvironmentToken = 'cloud'`.
- Общая DI-регистрация вынесена в `bootstrapShared()`.
- Cloud entry point регистрирует Cloud-реализации API-токенов и PageObject.
- Регистрирует person-limits + board-settings PageModification.

### FR-2: DI-токен окружения

- `jiraEnvironmentToken`: `Token<'server' | 'cloud'>`.
- `content.ts` → `'server'`, `content-cloud.ts` → `'cloud'`.

### FR-3: Cloud BoardPage PageObject

- `CloudBoardPagePageObject` реализует `IBoardPagePageObject`.
- Использует Cloud DOM-селекторы (`data-test-id` вместо `ghx-*`).
- Добавить в `IBoardPagePageObject`:
  - `selectors.boardHeaderTarget` — куда монтировать контейнер аватаров (Server: `#subnav-title`)
  - `getIssueCssSelector(editData: any): string` — полный CSS-селектор issues с учётом subtask-фильтра

### FR-4: Параметризация PersonLimitsBoardPage через PageObject

- Заменить hardcoded DOM-селекторы на `pageObject.selectors.*`
- `appendStyles()` → упростить до `.no-visibility { display: none !important }`
- `getCssSelectorOfIssues()` → `pageObject.getIssueCssSelector(editData)`
- Один класс, работает для обоих окружений

### FR-5: Параметризация BoardSettingsBoardPage через PageObject

- Заменить прямое использование `BoardPagePageObject.selectors.sidebar` на инжекцию через DI-токен.
- Один класс, работает для обоих окружений.

### FR-6: Cloud API адаптеры

Для Cloud entry point зарегистрировать Cloud-реализации:
- `getBoardEditDataToken` → Cloud adapter (Agile REST API, если `greenhopper` недоступен)
- `buildAvatarUrlToken` → Cloud-формат URL аватаров
- `searchUsersToken` → проверить совместимость, при необходимости Cloud-обёртка
- `getBoardPropertyToken`, `updateBoardPropertyToken` → проверить, при необходимости Cloud-реализация

### FR-7: Адаптация свимлейнов

- Свимлейны опциональны. Если `pageObject.getSwimlanes()` → `[]` → `swimlanes: []` (all).
- `PersonLimitsSettingsTab` получает `swimlanes` как prop — Cloud передаёт `[]` если свимлейнов нет.

## 6. Сценарии

### S1: Person Limits на Cloud-доске (happy path)

- Given пользователь открывает Kanban-доску в Jira Cloud (Company-managed)
- And настроены персональные WIP-лимиты в board property
- When доска загружена
- Then расширение показывает аватары с подсчётом WIP
- And подсвечивает карточки при превышении лимита

### S2: Настройка Person Limits через SettingsTab в Cloud

- Given пользователь на Cloud-доске
- When нажимает иконку jira-helper settings
- Then открывается модалка с вкладкой Person Limits
- And видит таблицу текущих лимитов, может добавить/редактировать/удалить
- And поле свимлейнов: показывает если есть, скрывает если нет
- When сохраняет — данные пишутся в board property

### S3: Отсутствие свимлейнов (edge case)

- Given Cloud-доска без свимлейнов
- When расширение подсчитывает WIP-лимиты
- Then подсчёт по всем карточкам в колонке
- And в настройках свимлейн-селектор скрыт / показывает "All"

### S4: Server не затронут (regression)

- Given пользователь на Jira Server
- Then всё работает как раньше

## 7. Данные и миграции

- Board Properties: формат одинаковый, миграции не нужны.
- API: `agile/1.0/board/{id}/properties` работает в Cloud через cookies (подтверждено).

## 8. Нефункциональные требования

- Unit tests: Cloud PageObject (mock DOM).
- Проверка что Models работают с Cloud PO через DI.
- Server regression: все существующие тесты зелёные.

## 9. Вне scope

- column-limits — отдельная итерация
- SettingsPage (страница настроек доски) для Cloud — не нужно
- Team-managed (Next-gen) проекты в Cloud
- Custom domains (не `*.atlassian.net`)
- Другие фичи расширения для Cloud

## 10. Открытые вопросы

### Закрытые

- [x] **API board properties**: работает в Cloud через cookies
- [x] **Match pattern**: `*://*.atlassian.net/*`
- [x] **Scope**: только person-limits
- [x] **SettingsPage**: не модифицируем для Cloud
- [x] **Свимлейны**: Company-managed Cloud поддерживает; опциональны
- [x] **PageModification reuse**: параметризация через PageObject selectors, один класс для обоих окружений

### TBD (при реализации)

- [ ] **Q3**: Доступен ли `greenhopper/.../editmodel.json` в Cloud? Если нет — adapter через Agile REST API
- [ ] **buildAvatarUrl Cloud**: Какой формат URL аватаров в Cloud? (вероятно из `avatarUrls` ответа user search)
- [ ] **searchUsers Cloud**: Совместим ли `api/2/user/search` с Cloud? Формат `accountId` vs `name`
- [ ] **localeProvider Cloud**: Как Cloud определяет locale? Fallback на 'en'
- [ ] **Конкретные DOM-селекторы Cloud доски**: определяются при реализации Cloud PageObject

## 11. Критерии приёмки

- [ ] Person-limits работают на Cloud-доске: аватары, подсчёт, подсветка
- [ ] Настройка через вкладку jira-helper settings на Cloud-доске
- [ ] Свимлейны: корректная обработка наличия/отсутствия
- [ ] Server не сломан (все существующие тесты зелёные)
- [ ] Manifest: отдельный content script для `*://*.atlassian.net/*`
- [ ] Модуль person-limits: минимум изменений (только параметризация selectors через PageObject)
- [ ] `PersonLimitsBoardPage` — один класс для Server и Cloud
