# TASK-73: Создать display.feature и step definitions для BoardPage

**Status**: DONE

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Создать feature файл для сценариев отображения (SC-DISPLAY-1 — SC-DISPLAY-7) и соответствующие step definitions.

## Файлы

```
src/person-limits/BoardPage/features/
├── display.feature              # новый - 7 сценариев
├── display.feature.cy.tsx       # новый - ~16 строк
└── steps/
    └── common.steps.ts          # новый - step definitions
```

## Сценарии (7)

| ID | Название |
|----|----------|
| SC-DISPLAY-1 | No limits configured shows nothing |
| SC-DISPLAY-2 | Counter within limit (green) |
| SC-DISPLAY-3 | Counter at limit (yellow) |
| SC-DISPLAY-4 | Counter over limit (red) with highlighted cards |
| SC-DISPLAY-5 | Person has no issues (zero count) |
| SC-DISPLAY-6 | Multiple people with limits |
| SC-DISPLAY-7 | Same person with multiple limits (different columns) |

## Что сделать

### 1. Создать `display.feature`

```gherkin
Feature: Personal WIP Limits on Board - Display

  Отображение счётчиков WIP-лимитов для пользователей на доске.
  Цвет счётчика зависит от заполненности: зелёный (в норме),
  жёлтый (на лимите), красный (превышен).

  @SC-DISPLAY-1
  Scenario: No limits configured shows nothing
    Given there are no WIP limits configured
    When the board is displayed
    Then no WIP limit counters should be visible
  ...
```

### 2. Создать step definitions в `common.steps.ts`

**Given степы:**
- `Given there are no WIP limits configured`
- `Given a WIP limit: login {string} name {string} value {int} columns {string} swimlanes {string} issueTypes {string}`
- `Given {string} has {int} issues on the board`
- `Given {string} has {int} issues in column {string}`

**When степы:**
- `When the board is displayed` — вызов mountComponent()

**Then степы:**
- `Then no WIP limit counters should be visible`
- `Then the counter for {string} should show {string}`
- `Then the counter for {string} should be {word}` (green/yellow/red)
- `Then I should see {int} counters for {string}`
- `Then the {word} counter for {string} should show {string}` (first/second)

### 3. Создать `display.feature.cy.tsx`

```typescript
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './display.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

## Критерии приёмки

- [x] `display.feature` содержит 7 сценариев
- [x] ID только в тегах, не в названиях
- [x] Описание Feature добавлено
- [x] Step definitions созданы и работают
- [x] `display.feature.cy.tsx` — ~16 строк
- [x] Тесты проходят: `npx cypress run --component --spec "src/person-limits/BoardPage/features/display.feature.cy.tsx"`

---

## Результаты

**Дата**: 2025-02-27

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Созданы display.feature (7 сценариев), common.steps.ts (step definitions), display.feature.cy.tsx (~16 строк). Добавлен data-status в AvatarBadge для проверки цвета счётчика (green/yellow/red). Рефакторинг: удалён stepContext, используется реальный flow — propertyStore + mock pageObject + applyLimits(). Given степы пишут лимиты в usePersonWipLimitsPropertyStore и добавляют issues через mockPageObject.addIssue(). When степ вызывает applyLimits() перед mountComponent(). Все 7 тестов проходят.

**Рефакторинг #2 (2025-02-27)**: DataTable для issues, удалён `Given "X" has no issues"`, добавлен SC-DISPLAY-8, обобщён ordinal (1st/2nd/first/second), `Then all N issues highlighted` проверяет mockPageObject.getHighlightedIssues(). BDD runner расширен: DataTable, {ordinal}. Все 8 тестов проходят.

## Зависимости

- Зависит от: TASK-72 (helpers)
- Референс: `src/person-limits/SettingsPage/features/`

---

## Проблема с текущей реализацией

### Проблема

Текущая реализация использует `stepContext` для передачи данных между Given шагами:

```typescript
// Given "WIP limit..." → сохраняет в stepContext.pendingLimits
// Given "has N issues" → находит в pendingLimits, создаёт готовые stats
// When "board is displayed" → кладёт stats в runtimeStore
```

Это **неправильный подход** — мы вручную создаём stats, обходя реальную логику приложения.

### Правильный подход

Использовать **реальный flow приложения**:

```
propertyStore (лимиты) + pageObject.getIssues() → calculateStats() → runtimeStore.stats
```

**Given степы:**
1. `Given "WIP limit..."` → кладёт лимит в `usePersonWipLimitsPropertyStore`
2. `Given "has N issues"` → регистрирует mock `pageObject.getIssues()` который возвращает нужные issues

**When степ:**
3. `When "board is displayed"` → вызывает `applyLimits()` (который вызывает `calculateStats()`) → затем `mountComponent()`

### Что исправить

1. **helpers.tsx**: убрать `stepContext`, добавить функцию для мока pageObject с issues
2. **common.steps.ts**: 
   - `Given "WIP limit..."` → `usePersonWipLimitsPropertyStore.getState().actions.setLimits([...limits, newLimit])`
   - `Given "has N issues"` → накапливает issues для pageObject mock
   - `When "board is displayed"` → регистрирует pageObject mock с накопленными issues, вызывает `applyLimits()`, затем `mountComponent()`

### Критерий приёмки (дополнительный)

- [x] `stepContext` удалён из helpers.tsx
- [x] Given степы работают через propertyStore и mock pageObject
- [x] When степ вызывает `applyLimits()` перед mount
- [x] Все 7 тестов проходят

---

## Проблема #2: Некорректные step definitions

### Проблемы

1. **`Given('there are issues on the board')`** — делает nothing (no-op), но должен добавлять issues в mock pageObject

2. **`Given "X" has no issues on the board`** — плохой дизайн. Если для персоны нет `Given` с issues, то у неё их и нет. Этот степ избыточен.

3. **Нет сценария "лимиты настроены, но доска пустая"** — нужно добавить

4. **`Given "X" has N issues in "column"`** — слишком простой. Нужен DataTable подход:
   ```gherkin
   Given the board has issues:
     | person   | column | swimlane | issueType |
     | john.doe | col1   |          | Task      |
     | jane.doe | col2   | lane1    | Bug       |
   ```
   - swimlane может быть пустой (доска без swimlanes)
   - issueType для фильтрации

5. **`Then all N issues for "X" should be highlighted red`** — проверяет только статус счётчика, а должен проверять какие issues были переданы в `pageObject.highlightIssues()`

6. **`the first counter for` / `the second counter for`** — нужно обобщить в `the {ordinal} counter for "X"` (first, second, third...)

### Что исправить

#### display.feature:

1. Убрать `And "X" has no issues on the board` из SC-DISPLAY-5
2. Добавить SC-DISPLAY-8: "Limits configured but board is empty"
3. Заменить `And "X" has N issues` на DataTable формат:
   ```gherkin
   Given the board has issues:
     | person   | column | swimlane | issueType |
     | john.doe | col2   |          | Task      |
   ```
4. Обобщить `the first/second counter for` в `the {ordinal} counter for`

#### common.steps.ts:

1. **Удалить** `Given "X" has no issues on the board` 
2. **Изменить** `Given('there are issues on the board')` — добавлять generic issues от anonymous user
3. **Добавить** `Given the board has issues:` с парсингом DataTable
4. **Удалить** отдельные `Given "X" has N issues on the board` и `Given "X" has N issues in "column"` — заменить на DataTable
5. **Изменить** `Then all N issues for "X" should be highlighted` — проверять вызов `pageObject.highlightIssues()`
6. **Обобщить** `the first/second counter` в `the {ordinal} counter for "X"` с парсингом ordinal (first=0, second=1, etc.)

#### helpers.tsx:

1. Добавить в mock pageObject метод `highlightIssues()` который сохраняет переданные issues
2. Добавить getter для проверки `getHighlightedIssues()`

### Критерий приёмки #2

- [x] `Given "X" has no issues on the board` удалён
- [x] `Given the board has issues:` с DataTable работает
- [x] Старые `Given "X" has N issues...` заменены на DataTable в feature файле
- [x] `Then all N issues should be highlighted` проверяет pageObject.getHighlightedIssues()
- [x] `the {ordinal} counter for "X"` обобщён (1st, 2nd, first, second...)
- [x] Добавлен SC-DISPLAY-8: лимиты есть, доска пустая
- [x] Все тесты проходят

---

## Проблема #3: DataTable для лимитов + новые сценарии

### Проблемы

1. **Лимиты настраиваются через старый формат** — нужен DataTable:
   ```gherkin
   Given there are WIP limits:
     | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
     | john.doe | John Doe          | 5     | col1    |           |            |
   ```

2. **В issues таблице нет personDisplayName** — нужно добавить:
   ```gherkin
   Given the board has issues:
     | person   | personDisplayName | column | swimlane | issueType |
     | john.doe | John Doe          | col2   |          | Task      |
   ```

3. **Нет тестов на swimlanes filtering** — добавить SC-DISPLAY-9

4. **Нет тестов на issueType filtering** — добавить SC-DISPLAY-10

5. **Нет теста на displayName matching** — когда person (login) отличается, но displayName совпадает (текущая логика приложения) — добавить SC-DISPLAY-11

### Что исправить

#### display.feature:

1. Заменить все `Given there is a WIP limit for...` на DataTable:
   ```gherkin
   Given there are WIP limits:
     | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
     | john.doe | John Doe          | 5     |         |           |            |
   ```

2. Добавить `personDisplayName` в `Given the board has issues:`

3. Добавить SC-DISPLAY-9: Swimlane filtering
   - Лимит с swimlane "lane1"
   - Issues в разных swimlanes
   - Считаются только issues в lane1

4. Добавить SC-DISPLAY-10: IssueType filtering
   - Лимит с issueType "Bug"
   - Issues с разными типами
   - Считаются только Bug

5. Добавить SC-DISPLAY-11: DisplayName matching
   - Лимит для person "john.doe" displayName "John Doe"
   - Issue с другим login но тем же displayName
   - Issue учитывается в лимите

#### common.steps.ts:

1. **Добавить** `Given there are WIP limits:` с DataTable
2. **Удалить** старые `Given there is a WIP limit for...` степы
3. **Обновить** `Given the board has issues:` — добавить парсинг personDisplayName

### Критерий приёмки #3

- [x] `Given there are WIP limits:` с DataTable работает
- [x] Старые `Given there is a WIP limit...` удалены
- [x] `personDisplayName` добавлен в обе таблицы
- [x] SC-DISPLAY-9: Swimlane filtering добавлен и проходит
- [x] SC-DISPLAY-10: IssueType filtering добавлен и проходит
- [x] SC-DISPLAY-11: DisplayName matching добавлен и проходит
- [x] Все тесты проходят

---

## Результаты #3 (2025-02-27)

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Проблема #3 решена. display.feature: все `Given there is a WIP limit for...` заменены на DataTable `Given there are WIP limits:` с колонками person, personDisplayName, limit, columns, swimlanes, issueTypes. В `Given the board has issues:` добавлена колонка personDisplayName. Добавлены сценарии SC-DISPLAY-9 (Swimlane filtering), SC-DISPLAY-10 (IssueType filtering), SC-DISPLAY-11 (DisplayName matching). common.steps.ts: добавлен `Given there are WIP limits:` с парсингом DataTable, удалены старые степы, обновлён `Given the board has issues:` для personDisplayName. helpers.tsx: добавлена поддержка swimlanes в mock (hasCustomSwimlanes, getSwimlanes, getColumnsInSwimlane). Все 11 тестов проходят.

---

## Проблема #4: SC-DISPLAY-5 должен иметь issues на доске

### Проблема

Сценарий SC-DISPLAY-5 "Person has no issues (zero count)" не имеет issues на доске вообще.

**Ожидание**: на доске есть задачи от ДРУГИХ людей, но не от john.doe. Счётчик показывает 0/5.

### Что исправить

В `display.feature` SC-DISPLAY-5 добавить issues от другого пользователя:

```gherkin
@SC-DISPLAY-5
Scenario: Person has no issues (zero count)
  Given there are WIP limits:
    | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
    | john.doe | John Doe          | 5     |         |           |            |
  Given the board has issues:
    | person   | personDisplayName | column | swimlane | issueType |
    | jane.doe | Jane Doe          | col2   |          | Task      |
    | jane.doe | Jane Doe          | col2   |          | Task      |
  When the board is displayed
  Then the counter for "john.doe" should show "0 / 5"
  And the counter for "john.doe" should be green
```

### Критерий приёмки #4

- [x] SC-DISPLAY-5 содержит issues от другого пользователя (jane.doe)
- [x] Тест проходит

---

## Результаты #4 (2025-02-27)

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

SC-DISPLAY-5 дополнен блоком `Given the board has issues:` с двумя issues от jane.doe. На доске есть задачи от другого пользователя, счётчик john.doe показывает 0/5 (зелёный). Все 11 тестов проходят.
