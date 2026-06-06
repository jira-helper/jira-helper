# Storybook Testing

Визуальное тестирование компонентов в изоляции через Storybook stories.

## Когда использовать

- Создан новый View-компонент
- Нужно документировать визуальные состояния
- Edge cases UI (длинные тексты, нулевые значения)

## Расположение файлов

Story файл рядом с компонентом:

```
src/<feature>/<Page>/components/
├── MyComponent.tsx
└── MyComponent.stories.tsx
```

## Запуск

```bash
npm run storybook
```

## Шаблон

```typescript
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: '<Feature>/<Page>/<ComponentName>',
  component: MyComponent,
  parameters: { layout: 'padded' },      // или 'centered'
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // default props
  },
};
```

## Правила

### 1. Title — отражает путь на файловой системе

Title должен отражать путь файла от `src/`. Директории `features/` и `components/` пропускаются, kebab-case конвертируется в PascalCase.

```typescript
// src/features/field-limits-module/SettingsPage/components/LimitForm.stories.tsx
title: 'FieldLimits/SettingsPage/LimitForm',

// src/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx
title: 'PersonLimits/BoardPage/AvatarBadge',

// src/shared/components/ColumnSelector/ColumnSelector.stories.tsx
title: 'Shared/ColumnSelector',
```

**ESLint правило** `local/require-storybook-title-hierarchy` автоматически проверяет и исправляет title при `npm run lint:eslint -- --fix`.

### 2. Обязательные stories

Каждый компонент должен иметь:

| Story | Описание |
|-------|----------|
| `Default` | Базовое состояние с типичными данными |
| Состояния по бизнес-логике | Зависят от компонента (ниже примеры) |

Примеры бизнес-состояний:

- **Badge**: `BelowLimit`, `OnLimit`, `OverLimit`
- **Form**: `Default`, `WithEditingData`, `Disabled`
- **Table**: `Default`, `Empty`, `ManyRows`
- **Modal**: `Default`, `WithData`
- **Button**: `Default`, `Disabled`, `Loading`

### 3. Используй `args`, не `render`

```typescript
// ✅ Предпочтительно — args
export const Default: Story = {
  args: {
    name: 'John Doe',
    value: 5,
    onSave: noop,
  },
};

// ✅ Допустимо — когда нужна обёртка или контекст
export const WithWrapper: Story = {
  render: () => (
    <div style={{ maxWidth: 500 }}>
      <MyComponent name="John" />
    </div>
  ),
};
```

### 4. Реалистичные данные

Фикстуры должны выглядеть как реальные данные, не как "test123":

```typescript
// ✅
const mockColumns: BoardColumn[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

// ❌
const mockColumns = [
  { id: '1', name: 'test1' },
  { id: '2', name: 'test2' },
];
```

### 5. Декораторы для layout

```typescript
const meta: Meta<typeof MyForm> = {
  // ...
  decorators: [
    Story => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};
```

### 6. noop для обработчиков

```typescript
const noop = () => {};

export const Default: Story = {
  args: {
    onSave: noop,
    onCancel: noop,
  },
};
```

## Чек-лист

- [ ] Файл `*.stories.tsx` рядом с компонентом
- [ ] `title` по формату `Feature/Page/Component`
- [ ] `tags: ['autodocs']`
- [ ] Story `Default` с типичными данными
- [ ] Stories для ключевых бизнес-состояний
- [ ] Реалистичные фикстуры (не "test123")
- [ ] `args` вместо `render` где возможно
- [ ] Storybook запускается без ошибок

## Visual Regression Testing

For screenshot-based visual regression testing, tag stories with `tags: ['visual']` and follow the [visual testing guide](../testing-visual.md).

**Example:**
```tsx
export const MyStory = {
  args: { /* ... */ },
  tags: ['visual']  // Opt-in to visual testing
} satisfies Story
```

## Референсы

- `src/features/field-limits-module/SettingsPage/components/LimitForm.stories.tsx`
- `src/features/field-limits-module/BoardPage/components/FieldLimitBadge.stories.tsx`
- `src/person-limits-module/SettingsPage/components/SettingsModal/SettingsModal.stories.tsx`
- `src/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx` - Example of visual-tagged stories
