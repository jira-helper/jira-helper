# Testing Guide

Стратегия тестирования проекта jira-helper.

## Тестовая пирамида

```
┌─────────────────────────────────────────────────────┐
│                    Storybook                        │  ← Визуальное тестирование
├─────────────────────────────────────────────────────┤
│       Cypress BDD Tests (.feature.cy.tsx)           │  ← BDD сценарии в браузере
├─────────────────────────────────────────────────────┤
│       Cypress Component Tests (.cy.tsx)             │  ← Тесты компонентов
├─────────────────────────────────────────────────────┤
│            Model Unit Tests (.test.ts)              │  ← Юнит-тесты моделей
├─────────────────────────────────────────────────────┤
│           Pure Functions Tests (.test.ts)           │  ← Юнит-тесты логики
└─────────────────────────────────────────────────────┘
```

| Уровень | Что тестируем | Инструмент | Файлы | Подробности |
|---------|---------------|------------|-------|-------------|
| Pure Functions | Трансформации, валидация, утилиты | Vitest | `*.test.ts` | [testing-unit.md](./testing-unit.md) |
| Model Units | Methods, state transitions | Vitest | `*.test.ts` | [testing-unit.md](./testing-unit.md) |
| Components | UI interactions, drag-n-drop | Cypress | `*.cy.tsx` | [testing-cypress-component.md](./testing-cypress-component.md) |
| BDD Components | .feature сценарии в браузере | Cypress | `*.feature.cy.tsx` | [testing-cypress-bdd.md](./testing-cypress-bdd.md) |
| Storybook | Визуальные состояния компонентов | Storybook | `*.stories.tsx` | [testing-storybook.md](./testing-storybook.md) |

## Запрещённые инструменты

| Инструмент | Почему не используем |
|------------|---------------------|
| React Testing Library (RTL) | Все компонентные тесты — через Cypress |
| vitest-cucumber | BDD тесты — только через Cypress BDD runner |

## Структура файлов

```
src/<feature>/
├── utils/
│   ├── myUtil.ts              # Чистая функция
│   └── myUtil.test.ts         # Vitest unit test
├── models/
│   ├── MyModel.ts             # Valtio model
│   └── MyModel.test.ts        # Vitest model test
├── SettingsPage/
│   ├── components/
│   │   ├── MyForm.tsx         # React View component
│   │   └── MyForm.stories.tsx # Storybook story
│   └── features/
│       ├── add-limit.feature           # Gherkin спецификация
│       ├── add-limit.feature.cy.tsx    # Cypress BDD runner
│       ├── steps/
│       │   └── common.steps.ts         # Step definitions
│       └── helpers.tsx                 # Фикстуры, mount, DI setup
└── BoardPage/
    └── components/
        ├── Badge.tsx
        └── Badge.stories.tsx
```

## Best Practices

### AAA-паттерн (Arrange-Act-Assert)

```typescript
it('should update item name', () => {
  // Arrange
  model.items = [{ id: 1, name: 'Old' }];

  // Act
  model.updateItemName(1, 'New');

  // Assert
  expect(model.items[0].name).toBe('New');
});
```

- **Arrange**: чистый экземпляр модели для каждого теста
- **Act**: одно действие на тест
- **Assert**: проверяй результат, не реализацию

### Изоляция тестов

Каждый тест — чистый state:

```typescript
beforeEach(() => {
  model = createMyModel();         // Valtio
  useStore.setState(getInitial()); // Zustand
  vi.clearAllMocks();
});
```

### Coincidental pass

Фикстуры должны иметь **уникальные значения** в каждом поле. Иначе assertion может проверять не то поле и всё равно проходить.

```typescript
// ❌ Одинаковые значения — coincidental pass
const item = { name: 'Test', title: 'Test', label: 'Test' };

// ✅ Разные значения — точная проверка
const item = { name: 'Alpha', title: 'Beta', label: 'Gamma' };
```

## Антипаттерны

| Антипаттерн | Проблема |
|-------------|----------|
| Тест mock-поведения | Проверяешь мок, а не код |
| Test-only методы в production | Загрязнение production API |
| Мок без понимания зависимостей | Ломает side-effects, от которых зависит тест |
| Неполные моки | Silent failures при обращении к пропущенным полям |
| Тесты как afterthought | TDD предотвращает все вышеперечисленные проблемы |

## Команды

| Команда | Описание |
|---------|----------|
| `npm test` | Запуск всех Vitest тестов |
| `npm test -- --run "path"` | Конкретный файл |
| `npx cypress run --component` | Все Cypress component тесты |
| `npx cypress open --component` | Cypress UI |
| `npm run storybook` | Storybook dev server |
| `npm run lint:eslint -- --fix` | ESLint |
