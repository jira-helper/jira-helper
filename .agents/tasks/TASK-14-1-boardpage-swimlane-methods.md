# TASK-14-1: Расширение BoardPagePageObject swimlane-методами

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: —

---

## Цель

Расширить существующий `BoardPagePageObject` в `src/page-objects/BoardPage.tsx` методами для работы со swimlane. Обе фичи (WIP Limits и Histogram) будут использовать один PageObject.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/page-objects/BoardPage.tsx` | Изменение |
| `src/page-objects/BoardPage.test.ts` | Создание |

---

## Требуемые изменения

### 1. Добавить типы

```typescript
export interface SwimlaneElement {
  id: string;
  element: Element;
  header: Element;
}
```

### 2. Расширить selectors

```typescript
selectors: {
  // ... существующие ...
  swimlaneHeader: '.ghx-swimlane-header',
  swimlaneRow: '.ghx-swimlane',
};
```

### 3. Добавить Query методы

```typescript
// Queries — чтение DOM (не мутируют)
getSwimlanes(): SwimlaneElement[];
getSwimlaneHeader(swimlaneId: string): Element | null;
getIssueCountInSwimlane(swimlaneId: string): number;
getIssueCountByColumn(swimlaneId: string): number[];
getIssueCountForColumns(swimlaneId: string, columns: string[]): number;
```

### 4. Добавить Command методы

Использовать паттерн из `CardPageObject.attach()`:

```typescript
// Commands — вставка React-компонентов
insertSwimlaneComponent(
  header: Element, 
  component: React.ReactNode, 
  key: string
): void;

removeSwimlaneComponent(header: Element, key: string): void;

highlightSwimlane(header: Element, exceeded: boolean): void;
```

### 5. Реализация insertSwimlaneComponent

```typescript
insertSwimlaneComponent(
  header: Element, 
  component: React.ReactNode, 
  key: string
): void {
  let container = header.querySelector(`[data-jh-attached-key="${key}"]`);
  if (container) return;
  
  container = document.createElement('span');
  container.setAttribute('data-jh-attached-key', key);
  header.insertAdjacentElement('afterbegin', container);
  
  const root = createRoot(container);
  root.render(component);
}
```

---

## Acceptance Criteria

- [ ] Типы `SwimlaneElement` добавлены
- [ ] Все Query методы реализованы
- [ ] Все Command методы реализованы
- [ ] Методы используют паттерн из `CardPageObject.attach()` для React
- [ ] Unit-тесты на все новые методы
- [ ] Существующие тесты не сломаны

---

## Контекст

Смотри существующую реализацию:
- `CardPageObject.attach()` — паттерн вставки React-компонентов
- `getColumns()` — паттерн Query метода
- Legacy: `src/swimlane/SwimlaneLimits.ts` — селекторы swimlane

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Добавлен интерфейс `SwimlaneElement` с полями `id`, `element`, `header`
- Добавлены селекторы `swimlaneHeader` и `swimlaneRow` в интерфейс и объект
- Реализованы Query-методы: `getSwimlanes`, `getSwimlaneHeader`, `getIssueCountInSwimlane`, `getIssueCountByColumn`, `getIssueCountForColumns`
- Реализованы Command-методы: `insertSwimlaneComponent`, `removeSwimlaneComponent`, `highlightSwimlane`
- Добавлены 11 unit-тестов для всех swimlane-методов
- Обновлены моки в `BoardPagePageObjectMock`, `DaysInColumnSettings.test.tsx`, `DaysInColumnSettings.stories.tsx`

**Проблемы и решения**:

**Проблема 1: Внутренние методы не в интерфейсе**

Контекст: Методы `getSwimlaneColumns`, `getColumnOrder`, `getColumnTitleToIdMap` не входили в `IBoardPagePageObject`

Решение: Вынесены в отдельные функции вне объекта

**Проблема 2: React-рендер в тестах**

Контекст: `insertSwimlaneComponent` требовал ожидания рендера

Решение: Использован `act()` из `@testing-library/react`

**Проблема 3: Конфликт DOM в тестах CardPageObject**

Контекст: Остатки DOM от swimlane-тестов влияли на тесты CardPageObject

Решение: Добавлен `beforeEach` с очисткой `document.body`
