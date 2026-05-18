# Requirements: Улучшение диагностики через DI для сбора данных от фич

**Feature folder**: `.agents/tasks/diagnostic-data-collection/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-05-14
**Статус**: agreed
**Has UI**: no

## 1. Цель и мотивация

Улучшение удобства диагностики через создание механизма сбора диагностических данных от всех фич расширения. Модуль диагностики должен предоставлять DI токен для регистрации callback функций, которые возвращают структурированные данные для диагностики. При выгрузке диагностических данных вызываются все зарегистрированные callbacks и формируется суммарный отчет. Механизм должен быть отказоустойчивым: если какая-то фича не может предоставить данные, диагностика продолжает работать, а ошибка фиксируется в отчете.

## 2. Пользователи и контекст

- **Роли / контекст использования**: Разработчики jira-helper при отладке проблем на продакшене или воспроизведении багов
- **Страницы Jira и точки входа**: существующее текущее место выгрузки диагностики (расширение текущего flow)

## 3. Функциональные требования

1. **FR-1**: Модуль диагностики предоставляет DI токен для регистрации callback функций сбора данных
2. **FR-2**: Каждая фича регистрирует callback через `registerDiagnosticData('featureName', () => Result<{...}>)` при инициализации своего модуля (в `register()`)
3. **FR-3**: Callback возвращает plain object с данными фичи, готовый для сериализации в JSON
4. **FR-4**: При выгрузке диагностических данных вызываются все зарегистрированные callbacks
5. **FR-5**: Результаты всех callbacks объединяются в суммарный отчет с ключами фич
6. **FR-6**: Если callback выбрасывает exception, ошибка фиксируется в отчете, диагностика продолжает работу
7. **FR-7**: В первой версии затронуть все фичи, перечисленные в разделе 5 (`boardProperty` и `localStorage`) и возвращать по ним диагностические данные

## 4. Сценарии (happy path + важные края)

### S1: Регистрация callback при инициализации модуля
- Given модуль диагностики предоставляет DI токен
- When фича инициализируется в `register()`
- Then фича вызывает `registerDiagnosticData('featureName', callback)`
- And callback сохраняется для будущего использования

### S2: Успешный сбор данных всех фич
- Given все фичи зарегистрировали свои callbacks
- When происходит выгрузка диагностических данных
- Then все callbacks вызываются последовательно
- And каждый callback возвращает `Result<T>` (Ok или Err)
- And данные из Ok результатов объединяются в отчет

### S3: Ошибка при сборе данных одной фичи
- Given фича зарегистрировала callback
- When callback выбрасывает exception или возвращает Err
- Then диагностика продолжает работу
- And ошибка фиксируется в отчете как отдельное поле
- And остальные callbacks выполняются

## 5. Данные и миграции

- **Источник истины данных**: в памяти диагностического модуля (локальный реестр callbacks)
- **Миграции / совместимость**: нет

### `column-limits-module`
* BoardProperty ✅ callback читает только текущее состояние `propertyModel` (`state`, `error`, `data`) и возвращает snapshot по ключу `subgroupsJH` (`WipLimitsProperty`) без вызова `load()`.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ✅ callback читает текущий runtime snapshot из `boardRuntimeModel` (`groupStats`, `cssNotIssueSubTask`) без вызова `calculateStats()`; при необходимости добавляем read-only `getDiagnosticSnapshot()`.
```js
{
  settings: {
    boardProperty: PropertyModel.data,
    localStorage: null
  },
  runtime: {
    groupStats: BoardRuntimeModel.groupStats
  }
}
```

### `person-limits-module`
* BoardProperty ✅ callback читает только текущее состояние `propertyModel` (`state`, `error`, `data`) и возвращает snapshot по ключу `personLimitsSettings` (`PersonWipLimitsProperty`) без вызова `load()`.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ✅ callback читает агрегаты runtime-модели без DOM (`activePerson`, `swimlanesActive`, `cssSelectorOfIssues`, `limits[]` c `issuesCount`/`isOverLimit`) без вызова `calculateStats()`; обязателен read-only `getDiagnosticSnapshot()` (без `issues: Element[]`).
```js
{
  settings: {
    boardProperty: PropertyModel.data,
    localStorage: null
  },
  runtime: BoardRuntimeModel.getDiagnosticSnapshot()
}
```

### `swimlane-wip-limits-module`
* BoardProperty ✅ callback читает только текущее состояние `propertyModel` (`state`, `error`, `settings`) и возвращает snapshot `jiraHelperSwimlaneSettings` (и meta про legacy-read `jiraHelperWIPLimits`) без вызова `load()`.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ✅ callback читает `isInitialized`, `stats`, `settingsCount` из runtime-модели без вызова `render()`/`calculateStats`; при необходимости добавить read-only `getDiagnosticSnapshot()`.
```js
{
  settings: {
    boardProperty: PropertyModel.settings,
    localStorage: null
  },
  runtime: {
    stats: BoardRuntimeModel.stats
  }
}
```

### `field-limits-module`
* BoardProperty ✅ callback читает текущее состояние `propertyModel` (`state`, `error`, `settings`) и возвращает snapshot по ключу `fieldLimitsJH` без вызова `load()`.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ✅ callback читает текущий snapshot `isInitialized`, `cssSelectorOfIssues`, `stats`, `limitsCount` без вызова `recalculate()`/`initialize()`; если прямого геттера нет, добавляем read-only `getDiagnosticSnapshot()`.
```js
{
  settings: {
    boardProperty: PropertyModel.settings,
    localStorage: null
  },
  runtime: {
    stats: BoardRuntimeModel.stats
  }
}
```

### `card-colors-module`
* BoardProperty ✅ callback читает текущее состояние `propertyModel` (`state`, `error`, `settings`) и возвращает snapshot ключа `card-colors` без вызова `load()`.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ✅ callback читает `isActive`, `error`, `intervalActive` через read-only диагностический геттер; не читаем private поля напрямую, не вызываем `activate()/deactivate()/processCards()`.
```js
{
  settings: {
    boardProperty: PropertyModel.settings,
    localStorage: null
  },
  runtime: RuntimeModel.getDiagnosticSnapshot()
}
```

### `sub-tasks-progress`
* BoardProperty ✅ callback читает только текущее состояние `useSubTaskProgressBoardPropertyStore.getState()` и возвращает ключ `sub-task-progress` + `BoardProperty` без вызова `loadSubTaskProgressBoardProperty`.
* LocalStorage ✅ читаем ключи user-guide (`jira-helper-user-guide-viewed`, `jira-helper-user-guide-view-count`) через `localStorage.getItem` и возвращаем отдельным блоком `userGuide`.
* Runtime ❌ отдельной DI runtime-модели нет; runtime-срез в v1 не собираем.
```js
{
  settings: {
    boardProperty: SubTaskProgressBoardPropertyStore.data,
    localStorage: {
      userGuideViewed: localStorage.getItem('jira-helper-user-guide-viewed'),
      userGuideViewCount: localStorage.getItem('jira-helper-user-guide-view-count')
    }
  },
  runtime: null
}
```

### `additional-card-elements`
* BoardProperty ✅ callback читает только текущее состояние `useAdditionalCardElementsBoardPropertyStore.getState()` и возвращает `AdditionalCardElementsBoardProperty` без вызова `loadAdditionalCardElementsBoardProperty`/сетевых API.
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ❌ отдельной DI runtime-модели нет; runtime-срез в v1 не собираем.
```js
{
  settings: {
    boardProperty: AdditionalCardElementsBoardPropertyStore.data,
    localStorage: null
  },
  runtime: null
}
```

### `wiplimit-on-cells`
* BoardProperty ✅ callback читает только уже загруженный state/кэш фичи для `wipLimitCells`; при отсутствии кэша добавляем read-only snapshot provider (без вызова `load`/API в callback).
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ❌ runtime store содержит только `cssSelectorOfIssues`, диагностическая ценность низкая; не включаем в v1.
```js
{
  settings: {
    boardProperty: WipLimitCellsPropertySnapshot.data,
    localStorage: null
  },
  runtime: null
}
```

### `charts/AddSlaLine`
* BoardProperty ✅ callback читает только already-available snapshot SLA config (`slaConfig3`) из состояния фичи; если snapshot сейчас не хранится, нужен новый read-only cache/snapshot provider, который обновляется в обычном жизненном цикле фичи (не в диагностическом callback).
* LocalStorage ❌ в фиче нет собственного persisted `localStorage`.
* Runtime ❌ отдельной DI runtime-модели нет; runtime-срез в v1 не собираем.
```js
{
  settings: {
    boardProperty: SlaConfigSnapshot.data,
    localStorage: null
  },
  runtime: null
}
```

### `gantt-chart`
* BoardProperty ❌ persisted boardProperty нет.
* LocalStorage ✅ callback читает уже загруженный state `ganttSettingsModel` (или предварительно поддерживаемый read-only snapshot localStorage payload) без вызова `load()` в callback.
* Runtime ✅ callback читает только текущие агрегаты из `ganttDataModel`, `ganttQuickFiltersModel`, `ganttViewportModel`; без вызовов `loadSubtasks()/recompute()/set*()`. Для единообразия добавить read-only `getDiagnosticSnapshot()` в каждую модель.
```js
{
  settings: {
    boardProperty: null,
    localStorage: GanttSettingsModel.getDiagnosticSnapshot()
  },
  runtime: {
    dataModel: GanttDataModel.getDiagnosticSnapshot(),
    quickFilters: GanttQuickFiltersModel.getDiagnosticSnapshot(),
    viewport: GanttViewportModel.getDiagnosticSnapshot()
  }
}
```

### `jira-comment-templates-module`
* BoardProperty ❌ persisted boardProperty нет.
* LocalStorage ✅ callback читает текущий state storage model (или read-only snapshot payload) и возвращает summary `jira_helper_comment_templates` (`version`, `templatesCount`, `enabled`) без вызова `load()/save*()`.
* Runtime ❌ runtime-model для board runtime отсутствует; в v1 не собираем.
```js
{
  settings: {
    boardProperty: null,
    localStorage: {
      commentTemplates: TemplatesStorageModel.getDiagnosticSnapshot()
    }
  },
  runtime: null
}
```

### `local-settings`
* BoardProperty ❌ persisted boardProperty нет.
* LocalStorage ✅ callback читает только `useLocalSettingsStore.getState().settings` (или read-only cached value key `jira-helper-local-settings`) без вызова `loadLocalSettings`.
* Runtime ❌ runtime-model отсутствует; в v1 не собираем.
```js
{
  settings: {
    boardProperty: null,
    localStorage: useLocalSettingsStore.getState().settings
  },
  runtime: null
}
```

### `blur-for-sensitive`
* BoardProperty ❌ persisted boardProperty нет.
* LocalStorage ✅ читаем key `blurSensitive` через `localStorage.getItem`.
* Runtime ❌ отдельной runtime-модели в DI нет; в v1 не собираем.
```js
{
  settings: {
    boardProperty: null,
    localStorage: {
      blurSensitive: localStorage.getItem('blurSensitive')
    }
  },
  runtime: null
}
```

### `bug-template`
* BoardProperty ❌ persisted boardProperty нет.
* LocalStorage ✅ читаем key `jira_helper_textarea_bug_template` через `localStorage.getItem`.
* Runtime ❌ отдельной runtime-модели в DI нет; в v1 не собираем.
```js
{
  settings: {
    boardProperty: null,
    localStorage: {
      bugTemplate: localStorage.getItem('jira_helper_textarea_bug_template')
    }
  },
  runtime: null
}
```

### 5.2 Правило реализации diagnostic callback (обязательно)

- Callback синхронный: `() => Result<PlainObject, Error>`.
- Callback side-effect free: не допускаются `await`, сетевые запросы, `load()/save()/persist()/render()/recalculate()/toggle()` и любые мутации state/DOM/localStorage/boardProperty.
- Callback только читает уже имеющиеся данные: state моделей, zustand/valtio snapshots, read-only cache.
- Если у модели нет безопасного read-only API для диагностики, добавляется отдельный метод `getDiagnosticSnapshot()`:
  - возвращает только plain JSON-serializable данные;
  - не меняет состояние;
  - не содержит DOM-ссылок (`Element`, `Node` и т.д.).

## 6. Нефункциональные требования

- **Отказоустойчивость**: Диагностика не должна падать при ошибках в callback фич
- **Тестирование (уровень)**: Vitest

## 7. Вне scope

- TBD (если есть ограничения, которые явно не делаем в этой итерации)

## 8. Открытые вопросы

- [x] Где именно вызывается механизм сбора диагностических данных? → в существующей точке выгрузки диагностики (расширяем текущий flow)
- [x] Где хранятся зарегистрированные callbacks? → в локальном реестре в памяти диагностического модуля
- [ ] Нужна ли обратная совместимость с существующим функционалом диагностики?
- [x] Какой формат итогового отчета? → плоский map `featureName -> data | error` (без отдельного поля status)
- [x] Какие именно фичи затрагиваются в первой версии? → см. явный список в разделе 5
- [x] Нужна ли приоритезация/порядок выполнения callbacks? → нет, порядок не важен
- [x] Нужен ли timeout для callback чтобы одна фича не блокировала диагностику? → нет, без timeout в v1

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] DI токен для регистрации diagnostic data доступен в контейнере
- [ ] Фича может зарегистрировать callback через `registerDiagnosticData('featureName', () => Result<{...}>)`
- [ ] Регистрация происходит в `register()` модуля фичи
- [ ] Callback возвращает plain object, сериализуемый в JSON
- [ ] При выгрузке диагностики вызываются все зарегистрированные callbacks
- [ ] Результаты объединяются в суммарный отчет
- [ ] Ошибка в callback не падает диагностику, фиксируется в отчете
- [ ] Все фичи с boardProperty/localStorage зарегистрированы в первой версии

## 10. UI Wireframe

Has UI: no - секция не заполняется.
