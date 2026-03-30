# TASK-173: Zustand store actions — убрать globalContainer.inject

**Status**: TODO

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Store action-функции в `src/shared/jira/` используют `globalContainer.inject()` напрямую — это Service Locator антипаттерн. Зависимости должны передаваться через параметры функции или через `this.di` (в `createAction`). Часть action'ов уже используют `this.di.inject()` через `createAction`, но другие используют `globalContainer` напрямую.

## Сущность

**Паттерн**: Store action-функции, которые вызывают `globalContainer.inject(...)` вместо получения зависимостей через DI

**Side effects**: Сетевые вызовы через injected сервисы, мутация Zustand stores

**Проблема**: `globalContainer.inject()` — это Service Locator, невозможно подменить в unit-тестах без мока `globalContainer`

## Кто и как использует

### Action-функции с `globalContainer.inject()` (нарушение)

| Файл | Что инжектит | Как используется потребителями |
|------|-------------|-------------------------------|
| `jira/boardProperty/actions/loadBoardProperty.ts` | `globalContainer.inject(BoardPropertyServiceToken)` | Вызывается из фич для загрузки board property |
| `jira/boardProperty/actions/updateBoardProperty.ts` | `globalContainer.inject(BoardPropertyServiceToken)` | Вызывается из фич для обновления board property (также через `createAction`) |
| `jira/fields/loadJiraFields.ts` | `globalContainer.inject(JiraServiceToken)` | Вызывается из `useGetFields` hook |
| `jira/jiraIssues/actions/loadIssue.ts` | `globalContainer.inject(JiraServiceToken)` | Вызывается из `loadSubtasksForIssue` и фич |
| `jira/stores/loadJiraIssueLinkTypes.ts` | `globalContainer.inject(JiraServiceToken)` | Вызывается из `useGetIssueLinkTypes` hook |

### Action-функции с `this.di.inject()` (уже OK, через createAction)

| Файл | Что инжектит |
|------|-------------|
| `jira/stores/jiraSubtasks.actions.ts` | `this.di.inject(loggerToken)`, `this.di.inject(JiraServiceToken)` |

### Потребители action-функций

| Action | Потребители |
|--------|-------------|
| `loadBoardProperty` | `features/field-limits`, `swimlane-wip-limits`, `wiplimit-on-cells`, `person-limits`, `column-limits` |
| `updateBoardProperty` (action) | `features/field-limits`, `swimlane-wip-limits`, `wiplimit-on-cells`, `person-limits`, `column-limits` |
| `loadJiraFields` | `useGetFields` hook, `useIssueConditionChecks`, `useSubtasksProgress` |
| `loadIssue` | `loadSubtasksForIssue`, фичи additional-card-elements |
| `loadJiraIssueLinkTypes` | `useGetIssueLinkTypes` hook |

## Какие токены надо экспортировать

Для этой задачи **не нужны новые токены**. Нужно заменить `globalContainer.inject()` на:

- **Для `createAction`-based**: использовать `this.di.inject()` (уже поддерживается фреймворком)
- **Для обычных функций**: передавать зависимости через аргумент `container: Container`

## Как поменяется код

### Вариант A: createAction (для функций, которые уже его используют)

**До** (`loadIssue.ts`):

```typescript
import { globalContainer } from 'dioma';

export const loadIssue = createAction({
  name: 'loadIssue',
  async handler(issueKey: string, abortSignal: AbortSignal) {
    const result = await globalContainer.inject(JiraServiceToken).fetchJiraIssue(issueKey, abortSignal);
    // ...
  },
});
```

**После**:

```typescript
export const loadIssue = createAction({
  name: 'loadIssue',
  async handler(issueKey: string, abortSignal: AbortSignal) {
    const result = await this.di.inject(JiraServiceToken).fetchJiraIssue(issueKey, abortSignal);
    // ...
  },
});
```

### Вариант B: Параметр container (для обычных функций)

**До** (`loadJiraFields.ts`):

```typescript
import { globalContainer } from 'dioma';

export const loadJiraFields = async (abortSignal: AbortSignal) => {
  const jiraService = globalContainer.inject(JiraServiceToken);
  // ...
};
```

**После**:

```typescript
import { Container } from 'dioma';

export const loadJiraFields = async (abortSignal: AbortSignal, container: Container) => {
  const jiraService = container.inject(JiraServiceToken);
  // ...
};
```

### Вариант C: Обернуть в createAction (для функций, которые его ещё не используют)

**До** (`loadBoardProperty.ts`):

```typescript
import { globalContainer } from 'dioma';

export const loadBoardProperty = async <T>(key: string) => {
  const boardService = globalContainer.inject(BoardPropertyServiceToken);
  // ...
};
```

**После**:

```typescript
export const loadBoardProperty = createAction({
  name: 'loadBoardProperty',
  async handler<T>(key: string) {
    const boardService = this.di.inject(BoardPropertyServiceToken);
    // ...
  },
});
```

## Файлы

```
src/shared/jira/
├── boardProperty/actions/
│   ├── loadBoardProperty.ts          # изменение: убрать globalContainer
│   └── updateBoardProperty.ts        # изменение: уже createAction, заменить globalContainer → this.di
├── fields/
│   └── loadJiraFields.ts             # изменение: убрать globalContainer
├── jiraIssues/actions/
│   └── loadIssue.ts                  # изменение: уже createAction, заменить globalContainer → this.di
├── stores/
│   └── loadJiraIssueLinkTypes.ts     # изменение: убрать globalContainer
```

Потребители (могут потребовать обновления сигнатуры вызова, если выбран вариант B):

```
src/shared/jira/fields/useGetFields.ts
src/shared/jira/stores/useGetIssueLinkTypes.ts
+ все фичи, вызывающие loadBoardProperty / updateBoardProperty
```

## Что сделать

1. `updateBoardProperty.ts` — заменить `globalContainer.inject` → `this.di.inject` (уже через `createAction`)
2. `loadIssue.ts` — заменить `globalContainer.inject` → `this.di.inject` (уже через `createAction`)
3. `loadBoardProperty.ts` — обернуть в `createAction` или добавить `container` параметр
4. `loadJiraFields.ts` — добавить `container` параметр или обернуть в `createAction`
5. `loadJiraIssueLinkTypes.ts` — добавить `container` параметр или обернуть в `createAction`
6. Обновить всех потребителей (если изменилась сигнатура)
7. Убедиться что нет import'ов `globalContainer` в `src/shared/jira/`

## Критерии приёмки

- [ ] Нет `globalContainer.inject()` в store action-файлах `src/shared/jira/`
- [ ] Все зависимости получаются через `this.di.inject()` или параметр `container`
- [ ] Потребители обновлены
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-170](./TASK-170-jira-api-migrate-to-di-tokens.md) — store actions используют jiraApi tokens
- Референс: `src/shared/jira/stores/jiraSubtasks.actions.ts` — пример корректного использования `this.di.inject()` через `createAction`
