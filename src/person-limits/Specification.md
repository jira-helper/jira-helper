# Personal WIP Limits

Модуль для управления персональными лимитами на количество задач (WIP limits) для каждого участника команды.

---

# Общая архитектура

## Board Property

**Сохранение**: Лимиты сохраняются в Board Property при нажатии кнопки Save в попапе настроек. При загрузке страницы настройки загружаются из Board Property.

**Реализация**:
- `BOARD_PROPERTIES.PERSON_LIMITS` — ключ для хранения
- Загрузка в `loadData()` класса `PersonalWIPLimit`
- Сохранение в `handleSubmit()` через `setBoardProperty()`

```typescript
type PersonLimit = {
  id: number;
  person: {
    name: string;
    displayName: string;
    self: string;
    avatar: string;
  };
  limit: number;
  columns: Array<{ id: string; name: string }>;  // [] = все колонки
  swimlanes: Array<{ id: string; name: string }>; // [] = все свимлейны
  includedIssueTypes?: string[];
};
```

## Store (Zustand + Immer)

**Файл**: `stores/personalWipLimitsStore.ts`

```typescript
interface State {
  data: {
    limits: PersonLimit[];
    checkedIds: number[];        // Выбранные чекбоксы в таблице
    editingId: number | null;    // ID редактируемого лимита
    formData: FormData | null;   // Данные формы
  };
  state: 'initial' | 'loading' | 'loaded';
  actions: Actions;
}
```

**Actions**:
- `setData(limits)` — инициализация/замена всех лимитов
- `addLimit(limit)` — добавление лимита (очищает formData)
- `updateLimit(id, limit)` — обновление лимита (очищает editingId и formData)
- `deleteLimit(id)` — удаление лимита
- `setEditingId(id)` — вход в режим редактирования (заполняет formData из лимита)
- `setFormData(formData)` — обновление данных формы
- `applyColumnsToSelected(columns)` — массовое применение колонок к выбранным
- `applySwimlanesToSelected(swimlanes)` — массовое применение свимлейнов к выбранным
- `reset()` — сброс к начальному состоянию

## Конвенция "All"

**Пустой массив = все**:
- `columns: []` означает "все колонки"
- `swimlanes: []` означает "все свимлейны"

**В UI**:
- При отображении пустой массив расширяется до всех ID
- При сохранении, если все выбраны → сохраняется пустой массив

---

# Фича: Settings Page

## User Story

Я хочу управлять персональными WIP-лимитами для каждого участника команды, указывая максимальное количество задач, которые человек может иметь одновременно. Хочу ограничить лимит определенными колонками, свимлейнами и типами задач.

## Типы данных

```typescript
type FormData = {
  personName: string;           // JIRA login пользователя
  limit: number;                // Максимум задач
  selectedColumns: string[];    // ID выбранных колонок ([] = все)
  swimlanes: string[];          // ID выбранных свимлейнов ([] = все)
  includedIssueTypes?: string[]; // Типы задач для подсчета
};

type Column = {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
};

type Swimlane = {
  id?: string;
  name: string;
};
```

## Архитектура компонентов

```
PersonalWIPLimit (PageModification)
  └── renderEditButton() → Button "Manage per-person WIP-limits"
      └── openPersonalSettingsPopup() → Popup
          └── PersonalWipLimitContainer
              ├── Form
              │   ├── Person JIRA name (Input)
              │   ├── Max issues at work (InputNumber)
              │   ├── IssueTypeSelector
              │   ├── Columns (Checkbox.Group + "All columns")
              │   └── Swimlanes (Checkbox.Group + "All swimlanes")
              └── PersonalWipLimitTable
```

## Настройки (Settings UI)

### Форма добавления/редактирования

- **Person JIRA name**: Input, связан с `formData.personName`. Используется для поиска пользователя через `getUser()`
- **Max issues at work**: InputNumber (min: 1), связан с `formData.limit`
- **Issue types**: `IssueTypeSelector`, связан с `formData.includedIssueTypes`. Если "Count all types" — `undefined`
- **Columns**: Checkbox "All columns" + Checkbox.Group. Связан с `formData.selectedColumns`. Если "All" — скрывается список
- **Swimlanes**: Checkbox "All swimlanes" + Checkbox.Group. Связан с `formData.swimlanes`. Если "All" — скрывается список

### Кнопки формы

- **Add limit**: Активна в режиме добавления (`editingId === null`). Вызывает `onAddLimit()`
- **Edit limit**: Активна в режиме редактирования (`editingId !== null`). Вызывает `onEditLimit()`
- **Cancel**: Появляется в режиме редактирования. Вызывает `setEditingId(null)`

### Таблица лимитов (PersonalWipLimitTable)

| Колонка | Описание |
|---------|----------|
| Checkbox | Для массовых операций, связан с `checkedIds` |
| Person | Аватар + displayName |
| Max | Значение `limit` |
| Columns | Названия колонок или "All" если пустой массив |
| Swimlanes | Названия свимлейнов или "All" если пустой массив |
| Actions | Кнопки Delete и Edit |

### Массовые операции

При наличии выбранных лимитов (`checkedIds.length > 0`) отображаются:
- **Apply columns to selected**: Dropdown с колонками + кнопка Apply
- **Apply swimlanes to selected**: Dropdown со свимлейнами + кнопка Apply

### Кнопки попапа

- **Save**: Сохраняет все лимиты в Board Property
- **Cancel**: Восстанавливает состояние из recoveryState

## Логика Actions

### createPersonLimit

```typescript
function createPersonLimit({ formData, person, columns, swimlanes, id }): PersonLimit {
  const { columns: resultColumns, swimlanes: resultSwimlanes } = transformFormData(
    formData.selectedColumns,
    formData.swimlanes,
    columns,
    swimlanes
  );
  
  return {
    id,
    person,
    limit: formData.limit,
    columns: resultColumns,
    swimlanes: resultSwimlanes,
    ...(formData.includedIssueTypes?.length > 0 
      ? { includedIssueTypes: formData.includedIssueTypes } 
      : {}),
  };
}
```

### updatePersonLimit

```typescript
function updatePersonLimit(existingLimit, formData, columns, swimlanes): PersonLimit {
  const { columns: resultColumns, swimlanes: resultSwimlanes } = transformFormData(
    formData.selectedColumns,
    formData.swimlanes,
    columns,
    swimlanes
  );
  
  return {
    ...existingLimit,
    limit: formData.limit,
    columns: resultColumns,
    swimlanes: resultSwimlanes,
    ...(formData.includedIssueTypes?.length > 0 
      ? { includedIssueTypes: formData.includedIssueTypes } 
      : {}),
  };
}
```

### transformFormData

```typescript
function transformFormData(
  selectedColumnIds: string[],
  selectedSwimlaneIds: string[],
  availableColumns: Column[],
  availableSwimlanes: Swimlane[]
): { columns: Array<{id, name}>, swimlanes: Array<{id, name}> } {
  // Если пустой массив — сохраняем как есть (означает "все")
  // Иначе — преобразуем ID в объекты {id, name}
}
```

## Интеграция

### Условия отображения

- **shouldApply()**: проверяет, что открыта вкладка Columns в настройках доски
- **waitForLoading()**: ожидает появления панели настроек
- **apply()**: рендерит кнопку и инициализирует store

### Data Flow

1. `apply()` загружает данные доски и лимиты из Board Property
2. Store инициализируется через `setData(limits)`
3. Клик по кнопке → открывается попап
4. `PersonalWipLimitContainer` подписывается на store
5. Пользователь заполняет форму → `setFormData()` обновляет store
6. Submit → вызывается `onAddLimit()` или `onEditLimit()`
7. Action создает/обновляет лимит → store обновляется
8. Компонент перерендеривается (Zustand subscription)
9. Save → `handleSubmit()` сохраняет в Board Property

## Тестирование

### Store tests (personalWipLimitsStore.test.ts)

- `setEditingId` устанавливает formData с колонками лимита
- `setEditingId` устанавливает formData с includedIssueTypes
- `setEditingId(null)` очищает formData
- `addLimit` очищает formData
- `updateLimit` очищает editingId и formData
- `setFormData` не влияет на editingId

### Component tests (PersonalWipLimitContainer.test.tsx)

- Кнопка Add активна при вводе в поле personName
- Список колонок появляется при снятии "All columns"
- Список свимлейнов появляется при снятии "All swimlanes"
- Колонки подтягиваются при редактировании лимита с колонками
- Колонки подтягиваются при редактировании лимита с пустым массивом (все)
- Форма очищается при нажатии Cancel
- Список колонок скрывается при выборе всех колонок
- Список колонок остается видимым при снятии одной колонки
- IssueTypeSelector сбрасывается после добавления лимита
- IssueTypeSelector заполняется при редактировании лимита с типами
- IssueTypeSelector сбрасывается при отмене редактирования

### Action tests

- `createPersonLimit`: создание с колонками, свимлейнами, типами задач
- `updatePersonLimit`: обновление полей, сохранение person
- `transformFormData`: преобразование ID в объекты, сохранение пустых массивов

### Storybook

- `EmptyState` — пустая таблица
- `AddMode` — режим добавления
- `EditMode` — режим редактирования
- `EditModeWithAllColumns` — редактирование с пустым массивом колонок
- `WithMultipleLimits` — несколько лимитов в таблице

---

# Файловая структура

```
src/person-limits/
├── BoardPage/
│   └── index.ts                    # Применение лимитов на доске
└── SettingsPage/
    ├── index.tsx                   # PageModification класс
    ├── htmlTemplates.tsx           # DOM селекторы
    ├── styles.module.css           # Стили
    ├── actions/
    │   ├── createPersonLimit.ts    # Создание лимита
    │   ├── updatePersonLimit.ts    # Обновление лимита
    │   └── transformFormData.ts    # Преобразование данных формы
    ├── components/
    │   ├── PersonalWipLimitContainer.tsx  # Контейнер формы
    │   └── PersonalWipLimitTable.tsx       # Таблица лимитов
    ├── state/
    │   └── types.ts                # Типы данных
    └── stores/
        └── personalWipLimitsStore.ts  # Zustand store
```
