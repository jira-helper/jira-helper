# Cypress Component Testing

Тесты компонентов в реальном браузере.

> **НЕ используем React Testing Library (RTL).** Все компонентные тесты — через Cypress.

## Когда использовать

- Пользовательские взаимодействия (click, type, select)
- Drag-n-drop, visual feedback
- Тесты с реальным DOM
- Тестирование компонентов с antd

Для BDD-сценариев из `.feature` файлов — см. [testing-cypress-bdd.md](./testing-cypress-bdd.md).

## Файлы

`*.cy.tsx` (НЕ `*.test.tsx`)

Расположение рядом с компонентом:

```
src/<feature>/<Page>/components/
├── MyComponent.tsx
└── MyComponent.cy.tsx
```

## Запуск

```bash
npx cypress run --component                  # все тесты
npx cypress open --component                 # интерактивный режим
npx cypress run --component --spec "src/path/to/file.cy.tsx"  # конкретный файл
```

## Структура теста

```typescript
/// <reference types="cypress" />
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset stores, DI
  });

  it('renders default state', () => {
    cy.mount(<MyComponent items={[]} onSave={cy.stub().as('onSave')} />);

    cy.contains('No items').should('be.visible');
  });

  it('calls onSave when button clicked', () => {
    cy.mount(<MyComponent items={mockItems} onSave={cy.stub().as('onSave')} />);

    cy.contains('button', 'Save').click();

    cy.get('@onSave').should('have.been.calledOnce');
  });
});
```

## Поиск элементов

Приоритет выбора селекторов:

```typescript
cy.contains('button', 'Save');       // По тексту (предпочтительно)
cy.get('[role="dialog"]');            // По роли/семантике
cy.get('#edit-person-name');          // По id
cy.get('[data-testid="custom"]');     // По data-testid (крайний случай)
```

## Assertions

```typescript
cy.contains('Save').should('be.visible');
cy.get('button').should('be.disabled');
cy.get('@onSave').should('have.been.calledOnce');
```

### Store assertions (дополнительно к UI)

```typescript
cy.then(() => {
  const state = useMyStore.getState();
  expect(state.data.items).to.have.length(1);
});
```

## UI-first проверки

Проверяй через UI, не через store:

```typescript
// ✅ Проверка через UI
cy.contains('tr', 'John Doe').should('be.visible');

// ❌ Только store — не отражает что видит пользователь
cy.then(() => expect(store.limits).to.have.length(1));
```

## Callbacks через cy.stub

```typescript
cy.mount(
  <MyComponent
    onSave={cy.stub().as('onSave')}
    onCancel={cy.stub().as('onCancel')}
  />
);

cy.contains('button', 'Save').click();
cy.get('@onSave').should('have.been.calledWith', expectedData);
```

## DI setup

```typescript
import { globalContainer } from 'dioma';

beforeEach(() => {
  globalContainer.reset();

  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: cy.stub().as('updateBoardProperty'),
  });
});
```

## Чек-лист

- [ ] Файл `*.cy.tsx` (НЕ `*.test.tsx`)
- [ ] `/// <reference types="cypress" />` в первой строке
- [ ] Рендеринг через `cy.mount()`
- [ ] User interactions (click, type, select)
- [ ] UI-first assertions
- [ ] Callbacks через `cy.stub()`
- [ ] Edge cases (пустые данные, disabled)
- [ ] Тесты проходят: `npx cypress run --component`
