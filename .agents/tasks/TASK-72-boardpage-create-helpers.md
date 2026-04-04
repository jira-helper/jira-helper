# TASK-72: Создать helpers.tsx с fixtures и setup для BoardPage

**Status**: DONE

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Создать файл helpers.tsx для BoardPage BDD тестов. Вынести fixtures, setup и mount функции из текущего монолитного теста.

## Файлы

```
src/person-limits/BoardPage/features/
├── helpers.tsx                  # новый
└── steps/                       # новая папка
```

## Что сделать

1. Создать папку `src/person-limits/BoardPage/features/`
2. Создать папку `src/person-limits/BoardPage/features/steps/`
3. Создать `helpers.tsx` с:

### Fixtures

```typescript
export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Swimlane 1' },
  { id: 'sw2', name: 'Swimlane 2' },
];
```

### Утилиты из текущего теста

- `createMockIssue(id, assignee, columnId, swimlaneId, issueType)` — создание mock DOM элемента
- `createStats(personName, displayName, limit, issues, columns, swimlanes, issueTypes)` — создание PersonLimitStats

### Setup

```typescript
export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);
  
  // Mock PageObject
  globalContainer.register({
    token: personLimitsBoardPageObjectToken,
    value: { ... }
  });
  
  useRuntimeStore.setState(getInitialState());
};
```

### Mount

```typescript
export const mountComponent = () => {
  cy.mount(<AvatarsContainer />);
};
```

## Критерии приёмки

- [ ] Папка `features/` создана
- [ ] Папка `features/steps/` создана
- [ ] `helpers.tsx` содержит все fixtures из текущего теста
- [ ] `helpers.tsx` содержит `setupBackground()` и `mountComponent()`
- [ ] Нет ошибок компиляции

## Зависимости

- Референс: `src/person-limits/SettingsPage/features/helpers.tsx`
- Исходный код: `src/person-limits/BoardPage/board-page.feature.cy.tsx` (строки 1-135)

---

## Результаты

**Дата**: 2026-02-27

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

- Создана папка `src/person-limits/BoardPage/features/`
- Создана папка `src/person-limits/BoardPage/features/steps/`
- Создан `src/person-limits/BoardPage/features/helpers.tsx` с:
  - Fixtures: `columns` (3 колонки), `swimlanes` (2 свимлейна)
  - `createMockIssue()` — создание mock DOM элемента с data-атрибутами
  - `createStats()` — создание PersonLimitStats с computeLimitId
  - `setupBackground()` — reset DI, registerLogger, mock PageObject, reset store
  - `mountComponent()` — cy.mount(AvatarsContainer)
- ESLint: 0 ошибок
