# TASK-48: Рефакторинг тестов BoardPage под новую структуру feature файла

**Status**: DONE

**Parent**: [EPIC-4](./EPIC-4-feature-tests-coverage.md)

---

## Описание

Feature файл `board-page.feature` был реструктурирован с новыми сценариями и семантическими ID. Нужно обновить тестовые файлы и исправить DI-проблему с `cy.on('uncaught:exception')`.

## Проблема с DI

В текущих тестах используется workaround:

```typescript
cy.on('uncaught:exception', err => {
  if (err.message.includes('Token is not registered')) {
    return false;
  }
});
```

Это скрывает ошибку вместо решения. Нужно зарегистрировать DI моки в `beforeEach`.

## Файлы

```
src/person-limits/BoardPage/
├── board-page.feature           # ✅ DONE - уже обновлён
├── board-page.feature.cy.tsx    # TODO - обновить
└── board-page.bdd.test.ts       # TODO - обновить
```

---

## Целевые сценарии (14 шт.)

### DISPLAY (7)

| ID | Описание |
|----|----------|
| SC-DISPLAY-1 | No limits configured shows nothing |
| SC-DISPLAY-2 | Counter within limit (green) |
| SC-DISPLAY-3 | Counter at limit (yellow) |
| SC-DISPLAY-4 | Counter over limit (red) with highlighted cards |
| SC-DISPLAY-5 | Person has no issues (zero count) |
| SC-DISPLAY-6 | Multiple people with limits |
| SC-DISPLAY-7 | Same person with multiple limits (different columns) |

### LIMIT SCOPE (4)

| ID | Описание |
|----|----------|
| SC-SCOPE-1 | Limit applies to specific columns only |
| SC-SCOPE-2 | Limit applies to specific swimlanes only |
| SC-SCOPE-3 | Limit applies to specific issue types only |
| SC-SCOPE-4 | Limit with combined filters (columns + swimlanes + types) |

### INTERACTION (3)

| ID | Описание |
|----|----------|
| SC-INTERACT-1 | Click avatar filters board |
| SC-INTERACT-2 | Click avatar again removes filter |
| SC-INTERACT-3 | Click second limit of same person |

---

## Что сделать

### 1. Исправить DI в `board-page.feature.cy.tsx`

В `beforeEach` добавить регистрацию DI токенов:

```typescript
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { personLimitsBoardPageObjectToken } from './pageObject';

beforeEach(() => {
  globalContainer.reset();
  registerLogger(globalContainer);
  
  // Mock PageObject
  globalContainer.register({
    token: personLimitsBoardPageObjectToken,
    value: {
      getIssues: () => [],
      getAssigneeFromIssue: () => null,
      getColumnId: () => null,
      getSwimlaneId: () => null,
      getIssueType: () => null,
      setIssueVisibility: cy.stub(),
      setIssueBackgroundColor: cy.stub(),
      resetIssueBackgroundColor: cy.stub(),
      getSwimlanes: () => [],
      getParentGroups: () => [],
      setSwimlaneVisibility: cy.stub(),
      setParentGroupVisibility: cy.stub(),
      countIssueVisibility: () => ({ total: 0, hidden: 0 }),
    },
  });
  
  useRuntimeStore.setState(getInitialState());
});
```

**Удалить** все `cy.on('uncaught:exception')` хаки.

### 2. Обновить сценарии на семантические ID

Переименовать все `Scenario('Board shows...')` на `Scenario('SC-DISPLAY-1: ...')` и т.д.

### 3. Добавить новые сценарии

- SC-DISPLAY-1: No limits configured
- SC-DISPLAY-5: Zero issues
- SC-DISPLAY-6: Multiple people
- SC-SCOPE-4: Combined filters
- SC-INTERACT-2: Toggle filter

### 4. Обновить `board-page.bdd.test.ts`

Аналогичные изменения для Vitest BDD тестов.

---

## Маппинг старых → новых ID

| Старый | Новый |
|--------|-------|
| Board shows cards count | SC-DISPLAY-2 |
| Board highlights person exceeding | SC-DISPLAY-4 |
| Board applies column-specific | SC-SCOPE-1 |
| Board applies swimlane-specific | SC-SCOPE-2 |
| Board applies issue type filter | SC-SCOPE-3 |
| Filtering by clicking on avatar | SC-INTERACT-1 |
| Filtering by clicking on second limit | SC-INTERACT-3 |
| NEW | SC-DISPLAY-1, SC-DISPLAY-3, SC-DISPLAY-5, SC-DISPLAY-6, SC-DISPLAY-7, SC-SCOPE-4, SC-INTERACT-2 |

---

## Критерии приёмки

- [ ] Убран `cy.on('uncaught:exception')` хак
- [ ] DI токены зарегистрированы в `beforeEach`
- [ ] Все 14 сценариев реализованы в `.cy.tsx`
- [ ] Все 14 сценариев реализованы в `.bdd.test.ts`
- [ ] Cypress тесты проходят: `npm run cy:run -- --spec "src/person-limits/BoardPage/board-page.feature.cy.tsx"`
- [ ] Vitest тесты проходят: `npm test -- --run src/person-limits/BoardPage`

---

## Результаты

**Дата**: 2026-02-15

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Выполнен рефакторинг тестов BoardPage под новую структуру feature файла:

1. Исправлена DI-проблема в board-page.feature.cy.tsx:
   - Добавлена регистрация DI токенов в beforeEach (globalContainer, registerLogger, personLimitsBoardPageObjectToken)
   - Удалены все cy.on('uncaught:exception') хаки
   - Зарегистрирован мок PageObject со всеми необходимыми методами

2. Обновлены сценарии на семантические ID:
   - SC-DISPLAY-2: Counter within limit (green)
   - SC-DISPLAY-4: Counter over limit (red) with highlighted cards
   - SC-SCOPE-1: Limit applies to specific columns only
   - SC-SCOPE-2: Limit applies to specific swimlanes only
   - SC-SCOPE-3: Limit applies to specific issue types only
   - SC-INTERACT-1: Click avatar filters board to show only matching issues
   - SC-INTERACT-3: Click second limit of same person

3. Добавлены новые сценарии в board-page.feature.cy.tsx:
   - SC-DISPLAY-1: No limits configured shows nothing
   - SC-DISPLAY-3: Counter at limit (yellow)
   - SC-DISPLAY-5: Person has no issues (zero count)
   - SC-DISPLAY-6: Multiple people with limits
   - SC-DISPLAY-7: Same person with multiple limits (different columns)
   - SC-SCOPE-4: Limit with combined filters (columns + swimlanes + types)
   - SC-INTERACT-2: Click avatar again removes filter

4. Обновлен board-page.bdd.test.ts:
   - Переименованы все сценарии на семантические ID
   - Добавлены недостающие сценарии (SC-DISPLAY-1, 3, 5, 6, 7, SC-SCOPE-4, SC-INTERACT-2)
   - Исправлены шаги для соответствия feature файлу ("has issues on the board:" вместо "has issues in the board:")

Все 14 сценариев реализованы в обоих тестовых файлах.
```

**Проблемы и решения**:

```
1. Проблема: ESLint ругался на неиспользуемые переменные columns и swimlanes
   Решение: Удалены неиспользуемые константы из верхней области видимости

2. Проблема: ESLint ругался на порядок параметров по умолчанию в createStats
   Решение: Перемещен includedIssueTypes в конец списка параметров (после параметров с дефолтными значениями)

3. Проблема: Нужно было обновить все вызовы createStats после изменения порядка параметров
   Решение: Проверены и исправлены все вызовы createStats в файле
```
