---
name: testing
description: Best practices тестирования в jira-helper. AAA-паттерн, изоляция тестов, тестовая стратегия (юниты функций, юниты stores, тесты компонентов, Storybook). Используй при написании тестов или ревью тестового кода.
---

# Тестирование в jira-helper

## Обязательный контекст

**Перед началом работы прочитай**:
- `docs/architecture_guideline.md` — раздел «Принцип 6: Тестирование»
- `docs/state-valtio.md` — раздел «Тестирование» (паттерн для Valtio Models)
- `docs/state-zustand.md` — раздел «Тестирование» (паттерн для Zustand Stores)

---

## Тестовая стратегия

> **ВАЖНО: НЕ используем react-testing-library (RTL) для тестов компонентов.**
> Все компонентные тесты пишем через **Cypress Component Testing** (`.cy.tsx`).

```
┌─────────────────────────────────────────────────────┐
│                    Storybook                        │  ← Визуальное тестирование
├─────────────────────────────────────────────────────┤
│       Cypress Component Tests (.cy.tsx)             │  ← ВСЕ тесты компонентов
├─────────────────────────────────────────────────────┤
│         Model BDD Tests (.bdd.test.ts)              │  ← Маппинг .feature → model
├─────────────────────────────────────────────────────┤
│            Model Unit Tests (.test.ts)              │  ← Юнит-тесты methods
├─────────────────────────────────────────────────────┤
│           Pure Functions Tests (.test.ts)           │  ← Юнит-тесты логики
└─────────────────────────────────────────────────────┘
```

| Уровень | Что тестируем | Инструмент | Скорость | Хрупкость |
|---------|---------------|------------|----------|-----------|
| Pure Functions | Трансформации, валидация | Vitest | Быстро | Стабильно |
| Model Units | Methods, state transitions | Vitest | Быстро | Стабильно |
| Model BDD | .feature → model methods | vitest-cucumber | Быстро | Стабильно |
| Components | Click, type, render, drag-n-drop | Cypress | Средне | Умеренно |
| Storybook | UI states, edge cases | Storybook | Visual | Стабильно |

### Связанные скиллы

- `.cursor/skills/vitest-bdd-testing/SKILL.md` — Vitest BDD store tests
- `.cursor/skills/cypress-bdd-testing/SKILL.md` — Cypress BDD component tests

---

## AAA-паттерн (Arrange-Act-Assert)

```typescript
it('should update item name', () => {
  // Arrange — подготовка
  model.items = [{ id: 1, name: 'Old' }];
  
  // Act — действие
  model.updateItemName(1, 'New');
  
  // Assert — проверка
  expect(model.items[0].name).toBe('New');
});
```

### Правила AAA

- **Arrange**: новый экземпляр модели для теста
- **Act**: одно действие на тест
- **Assert**: проверяй результат, не реализацию

---

## Изоляция тестов

> Паттерны создания экземпляров для Valtio и Zustand — см. `docs/architecture_guideline.md`, раздел «Принцип 8».

### Моки зависимостей

```typescript
import { vi } from 'vitest';

vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

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
});
```

---

## Cypress Component Tests

> **НЕ используем RTL.** Файлы: `*.cy.tsx` (НЕ `*.test.tsx`).

**Подробности**: см. `.cursor/skills/cypress-bdd-testing/SKILL.md`

### Поиск элементов

```typescript
cy.contains('button', 'Save');       // По тексту (предпочтительно)
cy.get('[role="dialog"]');            // По CSS-селектору
cy.get('#edit-person-name');          // По id
cy.get('[data-testid="custom"]');     // По data-testid (крайний случай)
```

### Assertions

```typescript
cy.contains('Save').should('be.visible');
cy.get('button').should('be.disabled');
cy.get('@onSave').should('have.been.calledOnce');

cy.then(() => {
  const state = useMyStore.getState();
  expect(state.data.items).to.have.length(1);
});
```

### Чек-лист Component Tests

- [ ] Файл `*.cy.tsx` (НЕ `*.test.tsx`)
- [ ] `/// <reference types="cypress" />` в первой строке
- [ ] Рендеринг через `cy.mount()`
- [ ] User interactions (click, type, select)
- [ ] Edge cases (пустые данные, disabled)

---

## BDD Tests

**Когда использовать**: есть `.feature` файл, нужен маппинг на model/store.

**Подробности**: см. `.cursor/skills/vitest-bdd-testing/SKILL.md`

```typescript
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

## Storybook

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
};
export default meta;

export const Default: Story = {
  render: () => <Badge color="blue">5</Badge>,
};

export const Warning: Story = {
  render: () => <Badge color="yellow">10</Badge>,
};
```

---

## Антипаттерны

- Тест без изоляции (используют состояние предыдущего теста)
- Тест реализации вместо поведения
- Несколько assertions разных вещей в одном тесте
- Магические таймауты вместо `waitFor`

### Coincidental pass

Если фикстура содержит одинаковые значения в разных полях, assertion может проверять не то поле и всё равно проходить. Используй разные значения в каждом поле фикстуры.

### Неполное покрытие сравнений

Если функция сравнивает несколько полей, тесты должны покрывать **все поля** с нетривиальными значениями.

---

## Инструменты

| Инструмент | Назначение |
|------------|------------|
| **Vitest** | Тест-раннер (unit tests, model/store tests) |
| **@amiceli/vitest-cucumber** | BDD тесты из .feature файлов |
| **Cypress** | ВСЕ тесты компонентов (.cy.tsx) |
| **Storybook** | Визуальное тестирование |
| ~~React Testing Library~~ | **НЕ ИСПОЛЬЗУЕМ** |

---

## Чек-лист при написании тестов

- [ ] AAA-структура (Arrange-Act-Assert)
- [ ] Изоляция (beforeEach reset)
- [ ] Один тест — одно поведение
- [ ] Описательные имена тестов
- [ ] Edge cases покрыты
- [ ] BDD тесты для .feature сценариев (если есть)
- [ ] Cypress для drag-n-drop / visual (если есть)
