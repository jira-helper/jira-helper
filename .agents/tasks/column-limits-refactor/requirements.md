# Requirements: Рефакторинг column-limits (zustand → valtio + PageObject)

**Feature folder**: `.agents/tasks/column-limits-refactor/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-04-05
**Статус**: agreed

## 1. Цель и мотивация

Модуль `src/column-limits` использует устаревший паттерн: три zustand-стора с отдельными action-файлами (`createAction`) и собственный `ColumnLimitsBoardPageObject`. Это противоречит текущему архитектурному гайдлайну проекта, где:

- Новые фичи используют **valtio Model-классы** (PropertyModel, SettingsUIModel, BoardRuntimeModel) с constructor DI.
- Action-файлы **на холде** — координация через методы Model.
- DOM-работа с доской происходит через общий **BoardPagePageObject**, а не через feature-специфичные PageObject-ы.

**Критерий успеха**: модуль `column-limits` приведён к той же архитектуре, что `swimlane-wip-limits` и `field-limits` — valtio Model-классы, `module.ts` с DI-регистрацией, без `createAction`, без `ColumnLimitsBoardPageObject`.

Это **рефакторинг без смены UX** — поведение фичи для пользователя не меняется.

## 2. Пользователи и контекст

- **Роли**: пользователь Jira-доски (видит бейджи и подсветку лимитов), администратор доски (настраивает лимиты в модалке).
- **Страницы Jira**:
  - **Board page** — отображение бейджей `N/M` на заголовках колонок, подсветка превышения лимита (красный фон), стилизация групп колонок (цветные рамки).
  - **Settings page** — модалка настроек column-limits (добавление/удаление/редактирование групп, drag-n-drop колонок, выбор swimlane-фильтра, выбор типов задач, выбор цвета).
- Настройки **изолированы по board** (хранятся в Jira Board Property `WIP_LIMITS_SETTINGS`).

## 3. Функциональные требования

### FR-1: Замена zustand-сторов на valtio Model-классы

Три zustand-стора заменяются на три valtio Model-класса:

| Zustand store | Valtio Model | Назначение |
|---|---|---|
| `useColumnLimitsPropertyStore` + `loadProperty` + `saveProperty` | `PropertyModel` | Загрузка/сохранение WipLimitsProperty из Jira Board Property |
| `useColumnLimitsRuntimeStore` + `calculateGroupStats` + `styleColumnHeaders` + `styleColumnsWithLimits` + `applyLimits` | `BoardRuntimeModel` | Подсчёт issue, вычисление groupStats, применение стилей на доске |
| `useColumnLimitsSettingsUIStore` + `saveToProperty` + `buildInitData` | `SettingsUIModel` | Состояние модалки настроек (группы, колонки, DnD, валидация) |

### FR-2: Ликвидация `ColumnLimitsBoardPageObject`

`ColumnLimitsBoardPageObject` — лишняя сущность. Его методы должны быть перераспределены:

| Метод ColumnLimitsBoardPageObject | Куда переносить | Обоснование |
|---|---|---|
| `getSwimlaneIds()` | `BoardPagePageObject` | Общий метод, уже частично покрыт через `getSwimlanes()` |
| `getIssuesInColumn()` | `BoardPagePageObject` | Подсчёт issue — общая задача, уже есть аналоги `getIssueCountInSwimlane`, `getIssueCountForColumns` |
| `getOrderedColumnIds()` | `BoardPagePageObject` | Общий метод, связан с `getColumns()` |
| `getColumnElement()` | `BoardPagePageObject` | Получение DOM-элемента колонки — общая задача |
| `shouldCountIssue()` | `BoardPagePageObject` (приватный) или чистая функция | Фильтрация по типу issue, уже есть `getIssueTypeFromCard` в BoardPage.tsx |
| `styleColumn()` | `BoardRuntimeModel` (или helper) | Стилизация — бизнес-логика фичи, не общий PageObject |
| `insertBadge()` / `removeBadges()` | `BoardRuntimeModel` (или helper) | Бейджи — специфика фичи, не общий PageObject |

### FR-3: Удаление action-файлов (`createAction`)

Все action-файлы заменяются методами соответствующих Model-классов:

| Action | → Model метод |
|---|---|
| `loadColumnLimitsProperty` | `PropertyModel.load()` |
| `saveColumnLimitsProperty` | `PropertyModel.persist()` |
| `calculateGroupStats` | `BoardRuntimeModel.calculateStats()` |
| `styleColumnHeaders` | `BoardRuntimeModel.applyStyles()` (или аналог) |
| `styleColumnsWithLimits` | `BoardRuntimeModel.applyStyles()` (или аналог) |
| `applyLimits` | `BoardRuntimeModel.apply()` (оркестрация) |
| `saveToProperty` | `SettingsUIModel.save()` |

### FR-4: Создание `module.ts` с DI-регистрацией

По образцу `swimlane-wip-limits/module.ts`: функция `registerColumnLimitsModule(container)` регистрирует все Model-ы через `proxy()` + `container.register()` с DI-токенами.

### FR-5: Создание `tokens.ts`

DI-токены для трёх Model-ов: `propertyModelToken`, `boardRuntimeModelToken`, `settingsUIModelToken`.

## 4. Сценарии (happy path + важные края)

> Поскольку это рефакторинг, сценарии **не меняются**. Ниже — существующие сценарии, которые должны продолжать работать.

### S1: Отображение лимитов на доске (Board page)

- Given: пользователь открыл доску с настроенными column-limits
- When: доска загружена, DOM отрендерен
- Then: на заголовках колонок отображаются бейджи `N/M`, группы стилизованы цветными рамками, превышение подсвечено красным

### S2: Настройка лимитов (Settings page)

- Given: пользователь открыл модалку настроек column-limits
- When: drag-n-drop колонки из "без группы" в группу, установка лимита, сохранение
- Then: данные сохранены в Jira Board Property, доска обновляется

### S3: Фильтрация по swimlane

- Given: группа настроена с конкретными swimlane
- When: доска отрисована
- Then: подсчёт issue учитывает только указанные swimlane

### S4: Фильтрация по типу задач

- Given: группа настроена с includedIssueTypes
- When: доска отрисована
- Then: подсчёт issue учитывает только указанные типы

### S5: Пустая доска / нет настроек

- Given: board property пуст или отсутствует
- When: доска загружена
- Then: фича не применяет стили, бейджи не отображаются

## 5. Данные и миграции

- **Источник истины данных**: Jira Board Property `WIP_LIMITS_SETTINGS` (тип `WipLimitsProperty = Record<string, ColumnLimitGroup>`)
- **Миграции**: не требуются — формат property не меняется
- **Обратная совместимость**: полная — property читается и записывается в том же формате
- **Типы** (`types.ts`): остаются без изменений (`ColumnLimitGroup`, `WipLimitsProperty`, `Column`, `UIGroup`, `IssueTypeState`, `WITHOUT_GROUP_ID`)

## 6. Нефункциональные требования

- **Тестирование**:
  - **Vitest** (unit): тесты Model-классов (PropertyModel, BoardRuntimeModel, SettingsUIModel), чистых функций (`calculateGroupStats` → метод модели, `buildInitData`, `saveToProperty` → метод модели)
  - **Cypress BDD** (component): существующие `.feature` + `.feature.cy.tsx` файлы должны продолжать работать после адаптации helpers-файлов
  - Существующие тесты: `runtimeStore.test.ts`, `settingsUIStore.test.ts`, `calculateGroupStats.test.ts`, `saveToProperty.test.ts`, `property/store.test.ts` — переписываются под новые Model-классы
- **Доступность**: без изменений (рефакторинг)
- **Производительность**: без изменений

## 7. Вне scope

- Изменение UI (внешний вид бейджей, подсветки, модалки настроек)
- Добавление новых фич (новых полей, новых сценариев)
- Изменение формата Jira Board Property
- Изменение BDD-сценариев (`.feature` файлы) — только адаптация step-определений и helpers
- Рефакторинг React-компонентов (View / Container) — обновляется только способ получения данных (zustand → valtio `useModel()`)
- Рефакторинг общего `BoardPagePageObject` за пределами добавления необходимых методов

## 8. Открытые вопросы

Все вопросы решены:

- [x] **Методы `styleColumn` / `insertBadge` / `removeBadges`**: → **(a) методы `BoardRuntimeModel`**, которая обращается к `BoardPagePageObject` через DI для DOM-операций.
- [x] **Метод `getOrderedColumnIds()`**: → **добавить в общий `BoardPagePageObject`**.
- [x] **Прямые обращения к DOM в `styleColumnsWithLimits`**: → **все DOM-операции только через PageObject**. `BoardRuntimeModel` координирует логику, но для работы с DOM вызывает методы `BoardPagePageObject`.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] Все три zustand-стора (`useColumnLimitsPropertyStore`, `useColumnLimitsRuntimeStore`, `useColumnLimitsSettingsUIStore`) заменены на valtio Model-классы
- [ ] Все action-файлы (`createAction`) удалены, логика перенесена в методы Model-ов
- [ ] `ColumnLimitsBoardPageObject` удалён; необходимые методы перенесены в `BoardPagePageObject` или в Model
- [ ] `module.ts` создан с DI-регистрацией всех Model-ов через `proxy()` + `container.register()`
- [ ] `tokens.ts` создан с DI-токенами
- [ ] Все существующие unit-тесты (vitest) переписаны и проходят
- [ ] Все существующие Cypress BDD-тесты проходят (с адаптацией helpers)
- [ ] Все Storybook stories продолжают работать
- [ ] Формат Jira Board Property не изменён
- [ ] Поведение фичи для пользователя не изменилось
