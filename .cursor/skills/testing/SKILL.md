---
name: testing
description: Best practices тестирования в jira-helper. AAA-паттерн, изоляция тестов, тестовая стратегия (юниты функций, юниты stores, тесты компонентов, Storybook). Используй при написании тестов или ревью тестового кода.
---

# Тестирование в jira-helper

## Тестовая стратегия

> **ВАЖНО: НЕ используем react-testing-library (RTL) для тестов компонентов.**
> Все компонентные тесты пишем через **Cypress Component Testing** (`.cy.tsx`).
> RTL НЕ устанавливать, НЕ импортировать, `.test.tsx` файлы для компонентов НЕ создавать.

```
┌─────────────────────────────────────────────────────┐
│                    Storybook                        │  ← Визуальное тестирование
├─────────────────────────────────────────────────────┤
│       Cypress Component Tests (.cy.tsx)             │  ← ВСЕ тесты компонентов
├─────────────────────────────────────────────────────┤
│         Store BDD Tests (.bdd.test.ts)              │  ← Маппинг .feature → store
├─────────────────────────────────────────────────────┤
│            Store Unit Tests (.test.ts)              │  ← Юнит-тесты actions
├─────────────────────────────────────────────────────┤
│           Pure Functions Tests (.test.ts)           │  ← Юнит-тесты логики
└─────────────────────────────────────────────────────┘
```

| Уровень | Что тестируем | Инструмент | Скорость | Хрупкость |
|---------|---------------|------------|----------|-----------|
| Pure Functions | Трансформации, валидация | Vitest | ⚡ Быстро | Стабильно |
| Store Units | Actions, state transitions | Vitest | ⚡ Быстро | Стабильно |
| Store BDD | .feature → store actions | vitest-cucumber | ⚡ Быстро | Стабильно |
| Components | Click, type, render, drag-n-drop, visual | Cypress | 🔄 Средне | Умеренно |
| Storybook | UI states, edge cases | Storybook | 👁️ Visual | Стабильно |

### Связанные скиллы

- `.cursor/skills/vitest-bdd-testing/SKILL.md` — Vitest BDD store tests
- `.cursor/skills/cypress-bdd-testing/SKILL.md` — Cypress BDD component tests

---

## AAA-паттерн (Arrange-Act-Assert)

Каждый тест делится на 3 секции:

```typescript
it('should update item name', () => {
  // Arrange — подготовка данных
  useMyStore.setState({ data: { items: [{ id: 1, name: 'Old' }] } });
  const { actions } = useMyStore.getState();
  
  // Act — выполнение действия
  actions.updateItemName(1, 'New');
  
  // Assert — проверка результата
  expect(useMyStore.getState().data.items[0].name).toBe('New');
});
```

### Правила AAA

- **Arrange**: минимум данных для теста
- **Act**: одно действие на тест
- **Assert**: проверяй результат, не реализацию

```typescript
// ❌ ПЛОХО: несколько действий
it('should handle workflow', () => {
  actions.setData({ name: 'test' });
  actions.validate();
  actions.submit();
  expect(store.submitted).toBe(true);
});

// ✅ ХОРОШО: одно действие
it('should set data', () => {
  actions.setData({ name: 'test' });
  expect(store.data.name).toBe('test');
});

it('should submit valid data', () => {
  store.setState({ data: { name: 'test', valid: true } });
  actions.submit();
  expect(store.submitted).toBe(true);
});
```

---

## Изоляция тестов

### Сброс store перед каждым тестом

```typescript
import { beforeEach } from 'vitest';

describe('MyStore', () => {
  beforeEach(() => {
    useMyStore.setState(useMyStore.getInitialState());
  });

  it('should work in isolation', () => {
    // Каждый тест начинается с чистого состояния
  });
});
```

### Моки зависимостей

```typescript
import { vi } from 'vitest';

// Мок модуля
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

// Мок компонента
vi.mock('./ChildComponent', () => ({
  ChildComponent: ({ onAction }: any) => (
    <button data-testid="mock-button" onClick={onAction}>Mock</button>
  ),
}));
```

### Очистка моков

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockOnAddLimit.mockClear();
});
```

---

## 1. Тесты Pure Functions

**Что тестировать**: трансформации, валидация, вычисления.

```typescript
// utils/transformFormData.test.ts
import { describe, it, expect } from 'vitest';
import { transformFormData } from './transformFormData';

describe('transformFormData', () => {
  const mockColumns = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
  ];

  it('should transform column IDs to column objects', () => {
    // Arrange
    const selectedColumnIds = ['col1'];

    // Act
    const result = transformFormData({
      selectedColumnIds,
      columns: mockColumns,
    });

    // Assert
    expect(result.columns).toEqual([{ id: 'col1', name: 'To Do' }]);
  });

  it('should filter out non-existent column IDs', () => {
    const result = transformFormData({
      selectedColumnIds: ['col1', 'non-existent'],
      columns: mockColumns,
    });

    expect(result.columns).toHaveLength(1);
  });

  it('should return empty array for empty input', () => {
    const result = transformFormData({
      selectedColumnIds: [],
      columns: mockColumns,
    });

    expect(result.columns).toEqual([]);
  });
});
```

### Чек-лист Pure Functions

- [ ] Happy path (основной сценарий)
- [ ] Edge cases (пустой массив, null, undefined)
- [ ] Error cases (невалидные данные)
- [ ] Type coercion (string vs number IDs)

---

## 2. Тесты Stores

**Что тестировать**: actions и state transitions.

```typescript
// stores/settingsUIStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsUIStore } from './settingsUIStore';

describe('settingsUIStore', () => {
  beforeEach(() => {
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have empty data', () => {
      const state = useSettingsUIStore.getState();
      
      expect(state.data.items).toEqual([]);
      expect(state.state).toBe('initial');
    });
  });

  describe('setData', () => {
    it('should set data and update state to loaded', () => {
      // Arrange
      const items = [{ id: 1, name: 'Test' }];

      // Act
      useSettingsUIStore.getState().actions.setData({ items });

      // Assert
      const state = useSettingsUIStore.getState();
      expect(state.data.items).toEqual(items);
      expect(state.state).toBe('loaded');
    });
  });

  describe('updateItem', () => {
    it('should update existing item', () => {
      // Arrange
      useSettingsUIStore.getState().actions.setData({
        items: [{ id: 1, name: 'Old' }],
      });

      // Act
      useSettingsUIStore.getState().actions.updateItem(1, { name: 'New' });

      // Assert
      expect(useSettingsUIStore.getState().data.items[0].name).toBe('New');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Arrange
      useSettingsUIStore.getState().actions.setData({
        items: [{ id: 1, name: 'Test' }],
      });

      // Act
      useSettingsUIStore.getState().actions.reset();

      // Assert
      const state = useSettingsUIStore.getState();
      expect(state.data.items).toEqual([]);
      expect(state.state).toBe('initial');
    });
  });
});
```

### Чек-лист Store Tests

- [ ] Initial state корректный
- [ ] Каждый action тестируется отдельно
- [ ] State transitions проверены
- [ ] Reset работает

---

## 3. Тесты компонентов (Cypress Component Testing)

> **НЕ используем react-testing-library (RTL).** Все тесты компонентов — через Cypress.

**Что тестировать**: user interactions, рендеринг по данным, click, type, drag-n-drop, visual feedback.

**Файлы**: `*.cy.tsx` (НЕ `*.test.tsx`)

**Подробности**: см. `.cursor/skills/cypress-bdd-testing/SKILL.md`

```typescript
/// <reference types="cypress" />
// components/SettingsButton/SettingsButton.cy.tsx
import React from 'react';
import { SettingsButton } from './SettingsButton';

describe('SettingsButton', () => {
  it('should render button with correct text', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} />);
    cy.contains('button', 'Manage per-person WIP-limits').should('be.visible');
  });

  it('should call onClick when clicked', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<SettingsButton onClick={onClick} />);
    cy.contains('button', 'Manage per-person WIP-limits').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} disabled />);
    cy.get('button').should('be.disabled');
  });
});
```

### Поиск элементов в Cypress

```typescript
// По тексту (предпочтительно)
cy.contains('button', 'Save');
cy.contains('Cancel');

// По CSS-селектору
cy.get('[role="dialog"]');
cy.get('.aui-button');

// По id
cy.get('#edit-person-name');

// По data-testid (крайний случай)
cy.get('[data-testid="custom-element"]');
```

### Assertions в Cypress

```typescript
// Видимость
cy.contains('Save').should('be.visible');
cy.get('[role="dialog"]').should('not.exist');

// Состояние
cy.get('button').should('be.disabled');
cy.get('input').should('have.value', 'test');

// Вызов стаба
cy.get('@onSave').should('have.been.calledOnce');

// Проверка store после действия
cy.then(() => {
  const state = useMyStore.getState();
  expect(state.data.items).to.have.length(1);
});
```

### Чек-лист Component Tests

- [ ] Файл называется `*.cy.tsx` (НЕ `*.test.tsx`)
- [ ] Первая строка: `/// <reference types="cypress" />`
- [ ] Рендеринг через `cy.mount()`
- [ ] User interactions (click, type, select)
- [ ] Assertions через `.should()`
- [ ] Edge cases (пустые данные, disabled)

---

## 4. Storybook

**Что тестировать**: визуальные состояния, edge cases UI.

```typescript
// Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  render: () => <Badge color="blue">5</Badge>,
};

export const Warning: Story = {
  render: () => <Badge color="yellow">10</Badge>,
};

export const Critical: Story = {
  render: () => <Badge color="red">15</Badge>,
};

export const Empty: Story = {
  render: () => <Badge color="gray">0</Badge>,
};

export const LongNumber: Story = {
  render: () => <Badge color="blue">9999</Badge>,
};
```

### Storybook с моками store

```typescript
// MyComponent.stories.tsx
import { useMyStore } from '../stores/myStore';

export const WithData: Story = {
  render: () => {
    useMyStore.setState({
      data: { items: mockItems },
      state: 'loaded',
    });
    return <MyComponent />;
  },
};

export const Loading: Story = {
  render: () => {
    useMyStore.setState({ state: 'loading' });
    return <MyComponent />;
  },
};

export const Empty: Story = {
  render: () => {
    useMyStore.setState({
      data: { items: [] },
      state: 'loaded',
    });
    return <MyComponent />;
  },
};
```

---

## Антипаттерны

```typescript
// ❌ ПЛОХО: тест без изоляции
it('should work', () => {
  // Использует состояние от предыдущего теста
});

// ❌ ПЛОХО: тест реализации, не поведения
it('should call internal method', () => {
  expect(component.internalMethod).toHaveBeenCalled();
});

// ❌ ПЛОХО: несколько assertions разных вещей
it('should do everything', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
  // Что именно тестируем?
});

// ❌ ПЛОХО: магические таймауты
await new Promise(resolve => setTimeout(resolve, 1000));
// Используй waitFor вместо этого
```

### Coincidental pass (тест проходит по совпадению)

Если фикстура содержит одинаковые значения в разных полях, assertion может
проверять не то поле и всё равно проходить.

```typescript
// ❌ ПЛОХО: у Alice columns="All", swimlanes="All", issueTypes="All"
// Ошибка в индексе (eq(3) вместо eq(2)) не ловится —
// все значения одинаковые
const fixture = createLimit('alice', 3, [], [], undefined);
cy.get('td').eq(3).should('have.text', 'All'); // swimlanes, не columns!

// ✅ ХОРОШО: фикстуры с разными значениями в каждом поле,
// или проверка через текст вместо индексов
```

### Неполное покрытие сравнений

Если функция сравнивает несколько полей (arrays, objects), тесты должны
покрывать **все поля** с нетривиальными значениями.

```typescript
// ❌ ПЛОХО: тестируем isDuplicate только с пустыми массивами
isDuplicate('john', [], [], undefined); // все фильтры пустые — узкий кейс

// ✅ ХОРОШО: тестируем с конкретными значениями в каждом параметре
isDuplicate('john', ['col1'], ['swim1'], ['Task', 'Bug']);
```

---

## Инструменты

| Инструмент | Назначение |
|------------|------------|
| **Vitest** | Тест-раннер (unit tests, store tests) |
| **@amiceli/vitest-cucumber** | BDD тесты из .feature файлов |
| **Cypress** | ВСЕ тесты компонентов (.cy.tsx) |
| **Storybook** | Визуальное тестирование |
| ~~React Testing Library~~ | **НЕ ИСПОЛЬЗУЕМ** |

---

## 5. Cypress Component Tests

**Когда использовать**: drag-n-drop, visual feedback, реальный браузер.

**Подробности**: см. `.cursor/skills/cypress-bdd-testing/SKILL.md`

```typescript
// SettingsPage.cy.tsx
import { useMyStore } from './stores/myStore';

describe('Feature: Settings', () => {
  beforeEach(() => {
    useMyStore.getState().actions.reset();
  });

  it('SC2: should move column via drag-n-drop', () => {
    cy.mount(<MyContainer />);
    cy.drag('[data-column-id="col1"]', '[data-group-id="g1"]');

    cy.then(() => {
      const group = useMyStore.getState().data.groups[0];
      expect(group.columns).to.have.length(1);
    });
  });
});
```

---

## 6. BDD Store Tests

**Когда использовать**: есть `.feature` файл, нужен маппинг на store.

**Подробности**: см. `.cursor/skills/vitest-bdd-testing/SKILL.md`

```typescript
// settingsUIStore.bdd.test.ts
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
const feature = await loadFeature('src/.../settings-page.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  Background(({ Given }) => {
    Given('I am on the settings page', () => {
      useMyStore.setState(useMyStore.getInitialState());
    });
  });

  Scenario('SC1: Cancel', ({ When, Then }) => {
    When('I click "Cancel"', () => {
      useMyStore.getState().actions.reset();
    });
    Then('changes should not be saved', () => {
      expect(useMyStore.getState().data.groups).toEqual([]);
    });
  });
});
```

---

## Чек-лист при написании тестов

- [ ] AAA-структура (Arrange-Act-Assert)
- [ ] Изоляция (beforeEach reset)
- [ ] Один тест — одно поведение
- [ ] Описательные имена тестов
- [ ] Edge cases покрыты
- [ ] Асинхронность через waitFor
- [ ] BDD тесты для .feature сценариев (если есть)
- [ ] Cypress для drag-n-drop / visual (если есть)
