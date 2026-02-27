---
name: spec-writer
description: Написание Specification.md для фичи jira-helper. Описывает что видит и делает пользователь, архитектуру и тестирование.
---

# Написание спецификации

Этот skill описывает формат и процесс создания Specification.md для фичи.

## Когда использовать

- После сбора требований и проектирования архитектуры
- Перед написанием feature файлов
- Когда нужно задокументировать существующую фичу

## Расположение файла

```
src/[feature-name]/Specification.md
```

---

## Шаблон Specification.md

```markdown
# [Название фичи]

[1-2 предложения: что делает фича и для кого]

---

# Общая архитектура

## Board Property

**Сохранение**: [Когда и как данные сохраняются в Jira]

**Реализация**:
- `BOARD_PROPERTIES.[KEY]` — ключ для хранения
- Загрузка в `loadData()` класса `[ClassName]`
- Сохранение в `handleSubmit()` через `setBoardProperty()`

```typescript
type [MainType] = {
  id: number;
  // поля с комментариями
};
```

## Store (Zustand + Immer)

**Файл**: `stores/[storeName].ts`

```typescript
interface State {
  data: {
    items: Item[];
    // UI-состояние
  };
  state: 'initial' | 'loading' | 'loaded';
  actions: Actions;
}
```

**Actions**:
- `setData(items)` — инициализация/замена данных
- `addItem(item)` — добавление элемента
- `updateItem(id, item)` — обновление элемента
- `deleteItem(id)` — удаление элемента
- `reset()` — сброс к начальному состоянию

## Конвенции

[Описание особых соглашений, например "пустой массив = все"]

---

# Фича: [Page Name]

## User Story

[Как пользователь, я хочу ... чтобы ...]

## Типы данных

```typescript
type FormData = {
  // поля формы
};

type [OtherType] = {
  // другие типы
};
```

## Архитектура компонентов

```
[RootComponent] (PageModification)
  └── renderEditButton() → Button "[Button text]"
      └── openPopup() → Popup
          └── [ContainerComponent]
              ├── Form
              │   ├── [Field 1]
              │   ├── [Field 2]
              │   └── [Field N]
              └── [TableComponent]
```

## Настройки (Settings UI)

### Форма добавления/редактирования

- **[Field 1]**: [Тип компонента], связан с `formData.[field]`. [Описание поведения]
- **[Field 2]**: [Тип компонента], связан с `formData.[field]`. [Описание поведения]

### Кнопки формы

- **Add**: Активна в режиме добавления. Вызывает `onAdd()`
- **Edit**: Активна в режиме редактирования. Вызывает `onEdit()`
- **Cancel**: Появляется в режиме редактирования. Сбрасывает форму

### Таблица данных

| Колонка | Описание |
|---------|----------|
| [Col 1] | [Описание] |
| [Col 2] | [Описание] |
| Actions | Кнопки Delete и Edit |

### Массовые операции

[Описание массовых операций если есть]

### Кнопки попапа

- **Save**: Сохраняет данные в Board Property
- **Cancel**: Восстанавливает состояние

## Логика Actions

### [actionName]

```typescript
function [actionName](params): ReturnType {
  // псевдокод логики
}
```

## Интеграция

### Условия отображения

- **shouldApply()**: [когда фича активна]
- **waitForLoading()**: [что ожидаем]
- **apply()**: [что делаем при инициализации]

### Data Flow

1. `apply()` загружает данные
2. Store инициализируется
3. Пользователь взаимодействует
4. Actions обновляют store
5. Компоненты перерендериваются
6. Save сохраняет в Board Property

## Тестирование

### Store tests ([storeName].test.ts)

- [Тест 1]
- [Тест 2]

### Component tests ([Component].test.tsx)

- [Тест 1]
- [Тест 2]

### Action tests

- [Тест 1]
- [Тест 2]

### Storybook

- `EmptyState` — пустое состояние
- `AddMode` — режим добавления
- `EditMode` — режим редактирования
- `[OtherState]` — другие состояния

---

# Файловая структура

```
src/[feature-name]/
├── Specification.md
├── types.ts
├── BoardPage/
│   └── index.ts
└── SettingsPage/
    ├── index.tsx
    ├── htmlTemplates.tsx
    ├── styles.module.css
    ├── actions/
    │   ├── [action1].ts
    │   └── [action2].ts
    ├── components/
    │   ├── [Container].tsx
    │   └── [Table].tsx
    └── stores/
        └── [storeName].ts
```
```

---

## Правила написания

### 1. Структура обязательна

Каждая спецификация должна содержать:
- Общая архитектура (Board Property, Store, Конвенции)
- Описание каждого UI-экрана (Settings, Board)
- Типы данных с примерами
- Data Flow
- Тестирование

### 2. Код конкретен

Не пиши абстрактно:

```markdown
❌ "Данные сохраняются в хранилище"
✅ "Данные сохраняются в Board Property через setBoardProperty(BOARD_PROPERTIES.MY_KEY, data)"
```

### 3. Связь с кодом

Указывай конкретные файлы и функции:

```markdown
❌ "В сторе есть actions"
✅ "**Actions**: setData(), addLimit(), updateLimit(), deleteLimit(), reset()"
```

### 4. Примеры TypeScript

Все типы должны быть с примерами:

```typescript
type PersonLimit = {
  id: number;
  person: {
    name: string;        // JIRA login
    displayName: string; // Отображаемое имя
  };
  limit: number;         // Максимум задач
};
```

### 5. Диаграммы компонентов

Используй ASCII-дерево для иерархии:

```
Container
├── Form
│   ├── Input
│   └── Button
└── Table
    └── Row
```

---

## Чек-лист перед завершением

- [ ] Описана архитектура хранения (Board Property / Store)
- [ ] Указаны все типы данных с JSDoc
- [ ] Описан каждый UI-экран
- [ ] Указаны все поля форм и их связь с данными
- [ ] Описан Data Flow
- [ ] Перечислены тесты для Store, Components, Actions
- [ ] Указаны Storybook stories
- [ ] Есть файловая структура

---

## Пример: см. `src/person-limits/Specification.md`

Используй как референс для формата и уровня детализации.
