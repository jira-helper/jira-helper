# TASK-45: Cypress тесты для SC16-SC17 (modal lifecycle)

**Status**: DONE

**Parent**: [EPIC-4](./EPIC-4-feature-tests-coverage.md)

---

## Описание

Реализовать Cypress BDD тесты для новых сценариев SC16 и SC17 в `person-limits/SettingsPage`. Эти сценарии покрывают открытие/закрытие модального окна и отображение начального состояния с пустыми и предзаполненными лимитами.

## Файлы

```
src/shared/di/
├── routingTokens.ts               # новый — DI токен для getBoardIdFromURL
└── jiraApiTokens.ts               # новый — DI токен для updateBoardProperty

src/person-limits/property/actions/
└── saveProperty.ts                # рефакторинг → createAction с DI

src/content.ts                     # добавить регистрацию токенов

src/person-limits/SettingsPage/
├── SettingsPage.feature           # уже обновлён (SC16, SC17)
└── SettingsPage.feature.cy.tsx    # исправить тесты (убрать uncaught:exception)
```

## Сценарии для реализации

### SC16: Open modal with empty state and default form values

```gherkin
Given there are no limits configured
When I click "Manage per-person WIP-limits" button
Then I should see the Personal WIP Limits modal
And I should see an empty limits table
And the person name field should be empty
And the limit field should show value 1
And "All columns" checkbox should be checked
And "All swimlanes" checkbox should be checked
And "Count all issue types" checkbox should be checked
When I click "Save"
Then the modal should be closed
```

### SC17: Open modal with pre-configured limits

```gherkin
Given there is a limit for "alice" with value 3 for all columns and all swimlanes
And there is a limit for "bob" with value 5 for columns "To Do, In Progress" only
And there is a limit for "charlie" with value 2 for swimlane "Frontend" only
And there is a limit for "diana" with value 4 for issue types "Task, Bug" only
And there is a limit for "eve" with value 6 for columns "In Progress", swimlane "Backend" and issue types "Story"
When I click "Manage per-person WIP-limits" button
Then I should see the Personal WIP Limits modal
And I should see 5 limits in the table
And I should see limit for "alice" with value 3 and "All" columns and "All" swimlanes
And I should see limit for "bob" with value 5 and columns "To Do, In Progress"
And I should see limit for "charlie" with value 2 and swimlane "Frontend"
And I should see limit for "diana" with value 4 and issue types "Task, Bug"
And I should see limit for "eve" with value 6, column "In Progress", swimlane "Backend" and issue types "Story"
When I click "Save"
Then the modal should be closed
```

## Что сделать

### Часть 1: Рефакторинг DI (предварительно)

1. Создать `src/shared/di/routingTokens.ts`:
   - Токен `getBoardIdFromURLToken`
   - Функция `registerRoutingInDI(container)`
2. Создать `src/shared/di/jiraApiTokens.ts`:
   - Токен `updateBoardPropertyToken`
   - Функция `registerJiraApiInDI(container)`
3. Рефакторинг `src/person-limits/property/actions/saveProperty.ts`:
   - Конвертировать в `createAction`
   - Использовать `this.di.inject()` для зависимостей
4. Обновить `src/content.ts`:
   - Добавить `registerRoutingInDI(container)`
   - Добавить `registerJiraApiInDI(container)`
5. Проверить что приложение работает (npm run dev или аналог)

### Часть 2: Исправление тестов

6. Обновить `SettingsPage.feature.cy.tsx`:
   - В `beforeEach`: `globalContainer.reset()`, `registerLogger(globalContainer)`
   - Зарегистрировать мок `getBoardIdFromURLToken` → `() => 'test-board-123'`
   - Зарегистрировать мок `updateBoardPropertyToken` → `cy.stub()`
7. Убрать `cy.on('uncaught:exception')` из SC16
8. Запустить тесты: `npm run test:cypress:component -- --spec "**/SettingsPage.feature.cy.tsx"`
9. Исправить ошибки линтера: `npm run lint:eslint -- --fix`

## Критерии приёмки

### DI рефакторинг
- [ ] Созданы `src/shared/di/routingTokens.ts` и `jiraApiTokens.ts`
- [ ] `saveProperty.ts` использует `createAction` с `this.di.inject()`
- [ ] Токены зарегистрированы в `content.ts`

### Тесты
- [ ] Нет `cy.on('uncaught:exception')` в тестах
- [ ] SC16 и SC17 используют DI моки через `globalContainer.register()`
- [ ] Все 17 тестов проходят: `npm run test:cypress:component -- --spec "**/SettingsPage.feature.cy.tsx"`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: существующие тесты в `src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx`
- Feature файл: `src/person-limits/SettingsPage/SettingsPage.feature` (SC16, SC17)

---

## Acceptance Bug #1 — FIXED

**Проблема**: В SC16 и SC17 монтировался `SettingsModalContainer` напрямую.

**Решение**: Теперь монтируется `SettingsButtonContainer`.

---

## Acceptance Bug #2

**Проблема**: В SC16 используется `cy.on('uncaught:exception')` для подавления ошибки "No board id". Это костыль.

**Root cause**: `SettingsButtonContainer` → `saveToProperty()` → `saveProperty()` → `jiraApi.setProperty()` → `getBoardIdFromURL()`. В тестовом окружении нет board id.

**Ожидаемое поведение**: 
- Замокать внешнюю зависимость (`saveToProperty` или `jiraApi.setProperty`)
- Убрать `cy.on('uncaught:exception')`
- Тест должен проверять что `saveToProperty` был вызван (или onSave callback)

**Текущее поведение**:
```typescript
cy.on('uncaught:exception', err => {
  if (err.message.includes('No board id')) {
    return false; // prevent Cypress from failing the test
  }
  return true;
});
```

**Файл**: `src/person-limits/SettingsPage/SettingsPage.feature.cy.tsx`

**Решение**: Рефакторинг на DI токены (см. ниже).

---

## Предварительный рефакторинг: DI токены

Перед исправлением тестов необходимо ввести DI токены для внешних зависимостей `getBoardIdFromURL` и `updateBoardProperty`.

### Шаг 1: Создать токены

```
src/shared/di/
├── routingTokens.ts       # новый
└── jiraApiTokens.ts       # новый
```

**routingTokens.ts**:
```typescript
import { Token, Container } from 'dioma';
import { getBoardIdFromURL } from 'src/routing';

export type GetBoardIdFromURL = typeof getBoardIdFromURL;
export const getBoardIdFromURLToken = new Token<GetBoardIdFromURL>('getBoardIdFromURL');

export const registerRoutingInDI = (container: Container) => {
  container.register({ token: getBoardIdFromURLToken, value: getBoardIdFromURL });
};
```

**jiraApiTokens.ts**:
```typescript
import { Token, Container } from 'dioma';
import { updateBoardProperty } from 'src/shared/jiraApi';

export type UpdateBoardProperty = typeof updateBoardProperty;
export const updateBoardPropertyToken = new Token<UpdateBoardProperty>('updateBoardProperty');

export const registerJiraApiInDI = (container: Container) => {
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
};
```

### Шаг 2: Конвертировать saveProperty в createAction

**До**:
```typescript
export const savePersonWipLimitsProperty = async (): Promise<void> => {
  const boardId = getBoardIdFromURL();
  // ...
};
```

**После**:
```typescript
import { createAction } from 'src/shared/action';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';

export const savePersonWipLimitsProperty = createAction({
  name: 'savePersonWipLimitsProperty',
  async handler() {
    const getBoardId = this.di.inject(getBoardIdFromURLToken);
    const updateProperty = this.di.inject(updateBoardPropertyToken);

    const boardId = getBoardId();
    if (!boardId) throw new Error('No board id');

    const { data } = usePersonWipLimitsPropertyStore.getState();
    updateProperty(boardId, BOARD_PROPERTIES.PERSON_LIMITS, data);
  },
});
```

### Шаг 3: Зарегистрировать в content.ts

```typescript
// content.ts initDiContainer()
registerRoutingInDI(container);
registerJiraApiInDI(container);
```

### Шаг 4: Исправить тесты

```typescript
// SettingsPage.feature.cy.tsx
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';

beforeEach(() => {
  globalContainer.reset();
  registerLogger(globalContainer);
  
  // Mock routing - return test board id
  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });
  
  // Mock jiraApi - stub updateBoardProperty
  globalContainer.register({
    token: updateBoardPropertyToken,
    value: cy.stub().as('updateBoardProperty'),
  });
});
```

Убрать `cy.on('uncaught:exception')` из SC16

---

## Результаты

**Дата**: 2026-02-15

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Итерация 1:
- Реализованы тесты SC16 и SC17

Итерация 2:
- Исправлено: монтируется SettingsButtonContainer

Итерация 3:
- Созданы DI токены: routingTokens.ts, jiraApiTokens.ts
- saveProperty.ts переведён на createAction с DI
- Токены зарегистрированы в content.ts
- Тесты используют globalContainer.register() для моков
- Все 17 тестов проходят
```

**Проблемы и решения**:

```
- Проблема: Использован SettingsModalContainer вместо SettingsButtonContainer
  Решение: Заменён на SettingsButtonContainer

- Проблема: cy.stub для saveToProperty / cy.on('uncaught:exception') для подавления ошибки "No board id"
  Решение: Рефакторинг на DI токены (getBoardIdFromURLToken, updateBoardPropertyToken)

- Проблема: линтер ругался на expect(...).to.be.true в Cypress
  Решение: eslint-disable-next-line no-unused-expressions
```
