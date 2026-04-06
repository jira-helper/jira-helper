# Requirements: Рефакторинг person-limits (zustand → valtio + DI Module)

**Feature folder**: `.agents/tasks/person-limits-refactor/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-04-06
**Статус**: agreed

## 1. Цель и мотивация

Модуль `src/person-limits` использует устаревший паттерн: три zustand-стора с отдельными action-файлами (`createAction`) и собственный `PersonLimitsBoardPageObject`. Это противоречит текущему архитектурному гайдлайну проекта, где:

- Новые фичи используют **valtio Model-классы** (PropertyModel, SettingsUIModel, BoardRuntimeModel) с constructor DI.
- Action-файлы **на холде** — координация через методы Model.
- Фичи собираются в **Module** (`class extends Module`) с ленивой DI-регистрацией через `lazy()` + `modelEntry()`.

**Критерий успеха**: модуль `person-limits` приведён к той же архитектуре, что `column-limits` (после его рефакторинга) — valtio Model-классы, `module.ts` + `tokens.ts` с DI-регистрацией, без `createAction`, без standalone action-файлов.

Это **рефакторинг без смены UX** — поведение фичи для пользователя не меняется.

## 2. Пользователи и контекст

- **Роли**: пользователь Jira-доски (видит аватары с бейджами лимитов, может фильтровать по человеку), администратор доски (настраивает персональные лимиты в модалке).
- **Страницы Jira**:
  - **Board page** — отображение аватаров с бейджами `N/M` для каждого лимита, подсветка задач при превышении лимита (красный фон), фильтрация задач по клику на аватар.
  - **Settings page** — модалка настроек person-limits (создание/редактирование/удаление лимитов, выбор человека, колонок, swimlane, типов задач, настройка `showAllPersonIssues`).
- Настройки **изолированы по board** (хранятся в Jira Board Property `PERSON_LIMITS`).

## 3. Функциональные требования

### FR-1: Замена zustand-сторов на valtio Model-классы

Три zustand-стора заменяются на три valtio Model-класса:

| Zustand store | Valtio Model | Назначение |
|---|---|---|
| `usePersonWipLimitsPropertyStore` + `loadProperty` + `saveProperty` | `PropertyModel` | Загрузка/сохранение PersonWipLimitsProperty из Jira Board Property, миграция данных |
| `useRuntimeStore` + `calculateStats` + `applyLimits` + `showOnlyChosen` | `BoardRuntimeModel` | Подсчёт issue по лимитам, подсветка превышений, фильтрация по выбранному человеку |
| `useSettingsUIStore` + `initFromProperty` + `saveToProperty` | `SettingsUIModel` | Состояние модалки настроек (CRUD лимитов, форма, редактирование, дубликаты) |

### FR-2: Удаление action-файлов (`createAction`)

Все action-файлы заменяются методами соответствующих Model-классов:

| Action | → Model метод | Примечание |
|---|---|---|
| `loadPersonWipLimitsProperty` | `PropertyModel.load()` | DI-зависимости (routingService, getBoardProperty) через constructor |
| `savePersonWipLimitsProperty` | `PropertyModel.persist()` | DI-зависимости (getBoardIdFromURL, updateBoardProperty) через constructor |
| `initFromProperty` | `SettingsUIModel.initFromProperty()` | Получает PropertyModel через constructor DI |
| `saveToProperty` | `SettingsUIModel.save()` | Копирует limits в PropertyModel, вызывает PropertyModel.persist() |
| `calculateStats` | `BoardRuntimeModel.calculateStats()` | Читает limits из PropertyModel (constructor DI), работает с PageObject |
| `applyLimits` | `BoardRuntimeModel.apply()` | Оркестрация: calculateStats → setStats → подсветка превышений |
| `showOnlyChosen` | `BoardRuntimeModel.showOnlyChosen()` | Фильтрация issue по activeLimitId |

### FR-3: Сохранение чистых функций как прямых импортов

Чистые функции без side effects остаются как прямые импорты (не DI):

| Функция | Расположение | Используется в |
|---|---|---|
| `createPersonLimit` | `SettingsPage/actions/createPersonLimit.ts` → `utils/` | SettingsUIModel или Container |
| `updatePersonLimit` | `SettingsPage/actions/updatePersonLimit.ts` → `utils/` | SettingsUIModel или Container |
| `transformFormData` | `SettingsPage/actions/transformFormData.ts` → `utils/` | createPersonLimit, updatePersonLimit |
| `isPersonLimitAppliedToIssue` | `BoardPage/utils/` (остаётся) | BoardRuntimeModel |
| `isPersonsIssue` | `BoardPage/utils/` (остаётся) | BoardRuntimeModel |
| `computeLimitId` | `BoardPage/utils/` (остаётся) | BoardRuntimeModel |
| `migrateProperty` | `property/migrateProperty.ts` (остаётся) | PropertyModel |

### FR-4: Создание `module.ts` с DI-регистрацией

По образцу `column-limits/module.ts`:

```
class PersonLimitsModule extends Module {
  register(container) {
    this.lazy(container, propertyModelToken, ...)
    this.lazy(container, boardRuntimeModelToken, ...)
    this.lazy(container, settingsUIModelToken, ...)
  }
}
export const personLimitsModule = new PersonLimitsModule();
```

Регистрация в `content.ts`: `personLimitsModule.ensure(container)`.

### FR-5: Создание `tokens.ts`

DI-токены для трёх Model-ов:

- `propertyModelToken` — `createModelToken<PropertyModel>('person-limits/propertyModel')`
- `boardRuntimeModelToken` — `createModelToken<BoardRuntimeModel>('person-limits/boardRuntimeModel')`
- `settingsUIModelToken` — `createModelToken<SettingsUIModel>('person-limits/settingsUIModel')`

### FR-6: Перевод SettingsUIModel.isDuplicate в метод Model

Функция `isDuplicate` в текущем zustand-сторе читает state через `useSettingsUIStore.getState()`. В valtio Model это станет обычным методом, читающим `this.limits`.

### FR-7: Обработка ошибок через Result

Методы Model-ов, работающие с внешним миром (load, persist), должны возвращать `Result<T, Error>` вместо throw/catch, по образцу column-limits PropertyModel.

## 4. Сценарии (happy path + важные края)

> Поскольку это рефакторинг, сценарии **не меняются**. Ниже — существующие сценарии, которые должны продолжать работать.

### S1: Отображение лимитов на доске (Board page)

- Given: пользователь открыл доску с настроенными person-limits
- When: доска загружена, DOM отрендерен
- Then: отображаются аватары с бейджами `N/M`; если `issues.length > limit` — задачи подсвечены красным фоном (`#ff5630`)

### S2: Фильтрация по человеку (Board page)

- Given: на доске отображаются аватары с лимитами
- When: пользователь кликает на аватар
- Then: отображаются только задачи этого человека (все задачи если `showAllPersonIssues=true`, или только matching если `false`); пустые swimlane и parent groups скрываются
- When: пользователь кликает на тот же аватар повторно
- Then: фильтр сбрасывается, все задачи видны

### S3: Настройка лимитов (Settings page)

- Given: пользователь открыл модалку настроек person-limits
- When: данные из PropertyStore копируются в UI
- Then: отображается список существующих лимитов, форма для создания/редактирования

### S4: Создание лимита

- Given: форма заполнена (person, limit, columns, swimlanes, issueTypes)
- When: пользователь нажимает "Добавить"
- Then: лимит создаётся с уникальным id, добавляется в список

### S5: Редактирование лимита

- Given: пользователь нажал "Редактировать" на лимите
- When: данные лимита загружены в форму (setEditingId → setFormData)
- Then: пользователь изменяет данные, нажимает "Сохранить"
- Then: лимит обновлён

### S6: Сохранение настроек

- Given: пользователь внёс изменения в лимиты
- When: нажимает "Сохранить" в модалке
- Then: limits копируются из SettingsUIModel в PropertyModel, вызывается persist() → данные записаны в Jira Board Property

### S7: Проверка дубликатов

- Given: пользователь пытается создать лимит
- When: уже существует лимит с тем же person + columns + swimlanes + issueTypes
- Then: isDuplicate() возвращает true (UI может показать предупреждение)

### S8: Swimlane-aware подсчёт

- Given: доска имеет custom swimlanes
- When: вычисляются stats
- Then: issue считаются с учётом swimlane-id; лимиты с конкретными swimlanes учитывают только указанные

### S9: Пустая доска / нет настроек

- Given: board property пуст или отсутствует
- When: доска загружена
- Then: фича не применяет стили, аватары не отображаются, stats пуст

### S10: Миграция данных

- Given: board property в формате v2.29 (без `showAllPersonIssues`)
- When: загрузка property
- Then: migrateProperty добавляет `showAllPersonIssues: true` к каждому лимиту

## 5. Данные и миграции

- **Источник истины данных**: Jira Board Property `PERSON_LIMITS` (тип `PersonWipLimitsProperty = { limits: PersonLimit[] }`)
- **Миграции**: не требуются — формат property не меняется. Существующая runtime-миграция `migrateProperty` (v2.29 → v2.30) сохраняется в PropertyModel.
- **Обратная совместимость**: полная — property читается и записывается в том же формате
- **Типы** (`property/types.ts`): остаются без изменений (`PersonLimit`, `PersonLimit_2_29`, `PersonWipLimitsProperty`)
- **UI типы** (`SettingsPage/state/types.ts`, `stores/settingsUIStore.types.ts`): остаются без изменений (`FormData`, `SelectedPerson`, `Column`, `Swimlane`)
- **Runtime типы** (`BoardPage/stores/runtimeStore.types.ts`): остаются без изменений (`PersonLimitStats`, `RuntimeStoreData`)

## 6. Нефункциональные требования

- **Тестирование**:
  - **Vitest** (unit): тесты Model-классов (PropertyModel, BoardRuntimeModel, SettingsUIModel), чистых функций (`transformFormData`, `createPersonLimit`, `updatePersonLimit`, `isPersonLimitAppliedToIssue`, `isPersonsIssue`, `computeLimitId`, `migrateProperty`)
  - **Cypress BDD** (component): существующие `.feature` + `.feature.cy.tsx` файлы должны продолжать работать после адаптации helpers-файлов
  - Существующие тесты: `runtimeStore.types.ts` (нет тестов стора, есть `calculateStats.test.ts`), `settingsUIStore` (нет отдельных тестов), `property/store` (нет отдельных тестов), action-тесты (`initFromProperty.test.ts`, `saveToProperty.test.ts`, `createPersonLimit.test.ts`, `updatePersonLimit.test.ts`, `transformFormData.test.ts`, `calculateStats.test.ts`, `isPersonLimitAppliedToIssue.test.ts`, `isPersonsIssue.test.ts`, `computeLimitId.test.ts`, `migrateProperty.test.ts`) — переписываются или адаптируются под новые Model-классы
- **Доступность**: без изменений (рефакторинг)
- **Производительность**: без изменений

## 7. Вне scope

- Изменение UI (внешний вид аватаров, бейджей, модалки настроек)
- Добавление новых фич (новых полей, новых сценариев)
- Изменение формата Jira Board Property
- Изменение BDD-сценариев (`.feature` файлы) — только адаптация step-определений и helpers
- Рефакторинг React-компонентов (View) — обновляется только Container (способ получения данных: zustand → valtio `useModel()`)
- Рефакторинг общего `BoardPagePageObject` за пределами необходимого

## 8. Открытые вопросы

Все вопросы решены:

- [x] **Судьба `PersonLimitsBoardPageObject`**: **(b) Перенести в `BoardPagePageObject`** — как было сделано для column-limits. Методы (getIssues, getColumns, getSwimlanes, getAssigneeFromIssue, getIssueType и т.д.) переносятся в общий PageObject. `PersonLimitsBoardPageObject` удаляется.
- [x] **Регистрация PageObject в DI**: По аналогии с column-limits — регистрация page object через `module.ts` (`this.lazy()`), а не в `BoardPage.apply()`.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] Все три zustand-стора (`usePersonWipLimitsPropertyStore`, `useRuntimeStore`, `useSettingsUIStore`) заменены на valtio Model-классы
- [ ] Все action-файлы (`createAction`) удалены, логика перенесена в методы Model-ов
- [ ] Standalone action-файлы (`initFromProperty`, `saveToProperty`, `loadProperty`, `saveProperty`, `calculateStats`, `applyLimits`, `showOnlyChosen`) удалены
- [ ] Чистые функции (`createPersonLimit`, `updatePersonLimit`, `transformFormData`) перемещены в `utils/` (или оставлены как прямые импорты)
- [ ] `module.ts` создан — `class PersonLimitsModule extends Module` с `lazy()` + `modelEntry()`
- [ ] `tokens.ts` создан с тремя DI-токенами (`propertyModelToken`, `boardRuntimeModelToken`, `settingsUIModelToken`)
- [ ] Модуль зарегистрирован в `content.ts` — `personLimitsModule.ensure(container)`
- [ ] Методы load/persist возвращают `Result<T, Error>` вместо throw
- [ ] Все существующие unit-тесты (vitest) переписаны и проходят
- [ ] Все существующие Cypress BDD-тесты проходят (с адаптацией helpers)
- [ ] Формат Jira Board Property не изменён
- [ ] Поведение фичи для пользователя не изменилось
