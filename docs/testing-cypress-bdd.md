# Cypress BDD Testing

Автоматическое выполнение BDD-сценариев из `.feature` файлов через Cypress component tests.
Сценарии парсятся из Gherkin, степы регистрируются отдельно и переиспользуются между файлами.

## Когда использовать

- Есть `.feature` файл с BDD сценариями
- Нужно проверить UI (drag-n-drop, click, visual feedback)
- Сценарий описывает **пользовательское взаимодействие**

## Структура файлов

```
src/[feature]/SettingsPage/features/
├── add-limit.feature              # Gherkin сценарии
├── edit-limit.feature
├── delete-limit.feature
├── modal-lifecycle.feature
├── person-search.feature
├── add-limit.feature.cy.tsx       # Cypress тесты (минимальный код)
├── edit-limit.feature.cy.tsx
├── delete-limit.feature.cy.tsx
├── modal-lifecycle.feature.cy.tsx
├── person-search.feature.cy.tsx
├── steps/
│   └── common.steps.ts            # Общие step definitions
└── helpers.tsx                    # Фикстуры, mount, DI setup

cypress/support/
├── bdd-runner.ts                  # BDD runner (парсинг + выполнение)
├── gherkin-steps/
│   └── common.ts                  # Глобальные step definitions
├── commands.ts                    # Custom Cypress commands
└── component.ts                   # mount setup
```

## Запуск

```bash
# Все BDD тесты
npx cypress run --component --spec "src/**/features/*.feature.cy.tsx"

# Конкретный файл
npx cypress run --component --spec "src/person-limits/SettingsPage/features/add-limit.feature.cy.tsx"

# Интерактивный режим
npx cypress open --component
```

## BDD Runner

Runner автоматически:
1. Парсит `.feature` файл
2. Создает `describe` для Feature и `it` для каждого Scenario
3. Выполняет Background перед каждым сценарием
4. Матчит текст степа с зарегистрированными step definitions

### Минимальный .cy.tsx файл

```typescript
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './add-limit.feature?raw';
import 'cypress/support/gherkin-steps/common';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

**Всего 7 строк!** Вся логика — в step definitions и helpers.

**ESLint правило** `require-gherkin-steps-import` автоматически добавит импорт при `npm run lint:eslint -- --fix`.

**Vite alias** в `cypress.config.ts` резолвит `cypress/support/gherkin-steps/common` в проект.

## Step Definitions

**Глобальные степы** — `cypress/support/gherkin-steps/common.ts` (ESLint добавит импорт автоматически).
**Фичевые степы** — `steps/common.steps.ts` рядом с `.feature.cy.tsx`.

```typescript
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';

When('I click {string}', (buttonText: string) => {
  cy.contains('button', buttonText).click();
});
```

### Паттерны в степах

| Паттерн | Regex | Пример матча |
|---------|-------|--------------|
| `{string}` | `"([^"]*)"` | `"John Doe"` |
| `{int}` | `(\d+)` | `5`, `10` |
| `{word}` | `([^\s]+)` | `john.doe` |

## Best Practices

### 1. Универсальные степы

Степы должны быть переиспользуемыми между сценариями:

```typescript
// ✅ ХОРОШО: универсальный степ с параметрами
Given(
  /^a limit: login "([^"]*)" name "([^"]*)" value (\d+) columns "([^"]*)" swimlanes "([^"]*)" issueTypes "([^"]*)"$/,
  (login, name, value, columns, swimlanes, issueTypes) => { ... }
);

// ❌ ПЛОХО: отдельный степ для каждого случая
Given('there is a limit for john with value 5', () => { ... });
Given('there is a limit for alice with value 3 for columns To Do', () => { ... });
```

### 2. UI-first проверки

Then-степы **обязаны** проверять через UI. Store-проверки допустимы **в дополнение**, но не вместо:

```typescript
// ✅ ХОРОШО: проверка через UI
Then('I should see {string} in the limits list', (name: string) => {
  cy.contains('tr', name).should('be.visible');
});

// ✅ ХОРОШО: UI + store (store как дополнительная гарантия)
Then('the limit should be saved', () => {
  cy.contains('tr', 'John Doe').should('be.visible');
  cy.then(() => {
    const limits = useStore.getState().data.limits;
    expect(limits).to.have.length(1);
  });
});

// ❌ ПЛОХО: только store без UI
Then('the limit should be added', () => {
  cy.then(() => {
    expect(useStore.getState().data.limits).to.have.length(1);
  });
});
```

### 3. Given степы могут работать со store

Для настройки начального состояния Given степы могут манипулировать store напрямую:

```typescript
// ✅ Допустимо для Given — настройка начального состояния
Given(/^a limit: login "([^"]*)"/, (login, ...) => {
  const propertyStore = usePropertyStore.getState();
  propertyStore.actions.setLimits([...propertyStore.data.limits, newLimit]);
});
```

### 4. Не дублируй бизнес-логику

Step definition не должен реимплементировать логику приложения:

```typescript
// ✅ ХОРОШО: монтируем реальный компонент
When('I open the settings modal', () => {
  mountSettingsButton();
  cy.contains('button', 'Manage per-person WIP-limits').click();
});

// ❌ ПЛОХО: копируем логику из приложения
When('I add a limit', () => {
  const formData = { ... };
  if (store.editingId !== null) {
    // 20 строк скопированной логики...
  }
});
```

### 5. Атомарные степы

Один степ = одно логическое действие:

```typescript
// ✅ ХОРОШО: атомарные степы
When('I search for {string} in person name field', ...);
When('I select {string} from search results', ...);

// ❌ ПЛОХО: несколько действий
When('I search and select {string}', ...);
```

## Helpers

`helpers.tsx` содержит фикстуры, DI setup и mount функции:

```typescript
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken, updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { usePersonWipLimitsPropertyStore } from '../../property/store';

// --- Fixtures ---
export const columns = [
  { id: 'col1', name: 'To Do', isKanPlanColumn: false },
  { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
  { id: 'col3', name: 'Done', isKanPlanColumn: false },
];

export const swimlanes = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

// --- Background setup ---
export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: cy.stub().as('updateBoardProperty'),
  });

  useSettingsUIStore.getState().actions.reset();
  usePersonWipLimitsPropertyStore.getState().actions.reset();
};

// --- Mount helpers ---
export const mountSettingsButton = () => {
  cy.mount(
    <SettingsButtonContainer
      boardDataColumns={columns}
      boardDataSwimlanes={swimlanes}
      searchUsers={mockSearchUsers}
    />
  );
};
```

## Конфигурируемые моки

Для сценариев с разным поведением API используй переключаемые моки:

```typescript
// helpers.tsx
type SearchMockType = 'default' | 'empty' | 'error';
let searchMockType: SearchMockType = 'default';

export const setSearchMockType = (type: SearchMockType) => {
  searchMockType = type;
};

export const mockSearchUsers = async (query: string): Promise<JiraUser[]> => {
  if (searchMockType === 'empty') return [];
  if (searchMockType === 'error') throw new Error('API error');
  // Default behavior...
};

// steps/common.steps.ts
Given('search returns no users', () => {
  setSearchMockType('empty');
});

Given('search API fails', () => {
  setSearchMockType('error');
});
```

## Чек-лист

- [ ] Первая строка: `/// <reference types="cypress" />`
- [ ] Импорт feature через `?raw`: `import featureText from './x.feature?raw'`
- [ ] Импорт глобальных степов: `import 'cypress/support/gherkin-steps/common'` (ESLint добавит автоматически)
- [ ] Импорт общих степов: `import './steps/common.steps'`
- [ ] `defineFeature` с `Background(() => setupBackground())`
- [ ] Step definitions в отдельном файле `steps/common.steps.ts`
- [ ] Степы универсальные (с параметрами, не hardcoded)
- [ ] Then-степы проверяют через UI
- [ ] Given степы настраивают store до открытия UI
- [ ] Моки API через DI, не через cy.intercept
- [ ] setupBackground сбрасывает stores и моки
- [ ] Тесты проходят: `npx cypress run --component`

## Референсы

- `cypress/support/bdd-runner.ts` — BDD runner
- `src/person-limits/SettingsPage/features/` — эталонный пример (36 сценариев в 5 файлах)
- `src/person-limits/SettingsPage/features/steps/common.steps.ts` — общие step definitions
