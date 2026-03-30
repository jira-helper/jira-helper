# TASK-170: jiraApi — перевод на DI tokens

**Status**: TODO

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Функции из `src/shared/jiraApi.ts` выполняют сетевые запросы к Jira REST API (fetch, I/O). Часть функций уже имеет DI-обёртки в `src/shared/di/jiraApiTokens.ts`, но используется напрямую через import. Другая часть вообще не имеет DI-токенов. Нужно: (1) перевести потребителей на существующие токены, (2) создать недостающие токены.

## Сущность

**Файл**: `src/shared/jiraApi.ts` — набор функций для работы с Jira REST API

**Side effects**: Сетевые запросы (fetch), `window.location`, `window.contextPath`, in-memory cache (`invalidatedProperties`)

**Существующие токены** (в `src/shared/di/jiraApiTokens.ts`):
- `getBoardPropertyToken` ← `getBoardProperty`
- `updateBoardPropertyToken` ← `updateBoardProperty`
- `searchUsersToken` ← `searchUsers`
- `getProjectIssueTypesToken` ← `getProjectIssueTypes`
- `buildAvatarUrlToken` ← `buildAvatarUrl`

**Функции БЕЗ токенов**:
- `getBoardEditData` — получение edit data доски
- `loadFlaggedIssues` — загрузка flagged issues
- `loadNewIssueViewEnabled` — проверка включения new issue view
- `deleteBoardProperty` — удаление board property
- `searchIssues` — поиск issues по JQL

## Кто и как использует

### A. Прямые импорты функций, у которых ЕСТЬ DI-токен (нарушение)

| Функция | DI-токен | Прямой import (нарушение) |
|---------|----------|--------------------------|
| `getBoardProperty` | `getBoardPropertyToken` | `person-limits/property/actions/loadProperty.ts`, `column-limits/property/actions/loadProperty.ts`, `card-colors/BoardPage.tsx`, `card-colors/SettingsPage.tsx` |
| `updateBoardProperty` | `updateBoardPropertyToken` | `card-colors/SettingsPage.tsx` |
| `searchUsers` | `searchUsersToken` | `person-limits/SettingsPage/index.tsx` |

### B. Функции без DI-токенов

| Функция | Потребители |
|---------|-------------|
| `getBoardEditData` | `src/features/field-limits/module.ts`, `src/swimlane-wip-limits/module.ts` |
| `loadFlaggedIssues` | `src/issue/MarkFlaggedIssues.ts` |
| `loadNewIssueViewEnabled` | `src/issue/MarkFlaggedIssues.ts` |

## Какие токены надо экспортировать

Добавить в `src/shared/di/jiraApiTokens.ts`:

```typescript
export type GetBoardEditData = (boardId: string, params?: Record<string, any>) => Promise<any>;
export const getBoardEditDataToken = new Token<GetBoardEditData>('getBoardEditData');

export type LoadFlaggedIssues = (keys: string[]) => Promise<any>;
export const loadFlaggedIssuesToken = new Token<LoadFlaggedIssues>('loadFlaggedIssues');

export type LoadNewIssueViewEnabled = (params?: Record<string, any>) => Promise<boolean>;
export const loadNewIssueViewEnabledToken = new Token<LoadNewIssueViewEnabled>('loadNewIssueViewEnabled');
```

Зарегистрировать в `registerJiraApiInDI`:

```typescript
export const registerJiraApiInDI = (container: Container) => {
  // Существующие
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
  container.register({ token: getBoardPropertyToken, value: getBoardProperty });
  container.register({ token: searchUsersToken, value: searchUsers });
  container.register({ token: getProjectIssueTypesToken, value: getProjectIssueTypes });
  container.register({ token: buildAvatarUrlToken, value: buildAvatarUrl });
  // Новые
  container.register({ token: getBoardEditDataToken, value: getBoardEditData });
  container.register({ token: loadFlaggedIssuesToken, value: loadFlaggedIssues });
  container.register({ token: loadNewIssueViewEnabledToken, value: loadNewIssueViewEnabled });
};
```

## Как поменяется код

### A. Замена прямых импортов на существующие токены

**До** (`card-colors/SettingsPage.tsx`):

```typescript
import { getBoardProperty, updateBoardProperty } from 'src/shared/jiraApi';

const data = await getBoardProperty(boardId, property);
updateBoardProperty(boardId, property, value);
```

**После**:

```typescript
import { getBoardPropertyToken, updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';

const getBoardProp = container.inject(getBoardPropertyToken);
const updateBoardProp = container.inject(updateBoardPropertyToken);

const data = await getBoardProp(boardId, property);
updateBoardProp(boardId, property, value);
```

### B. Новые токены

**До** (`field-limits/module.ts`):

```typescript
import { getBoardEditData } from 'src/shared/jiraApi';

const editData = await getBoardEditData(boardId);
```

**После**:

```typescript
import { getBoardEditDataToken } from 'src/shared/di/jiraApiTokens';

const getBoardEditData = container.inject(getBoardEditDataToken);
const editData = await getBoardEditData(boardId);
```

## Файлы

```
src/shared/di/
├── jiraApiTokens.ts                          # изменение: 3 новых токена + регистрация

src/person-limits/
├── property/actions/loadProperty.ts          # изменение: getBoardProperty → token
├── SettingsPage/index.tsx                    # изменение: searchUsers → token

src/column-limits/
├── property/actions/loadProperty.ts          # изменение: getBoardProperty → token

src/card-colors/
├── BoardPage.tsx                             # изменение: getBoardProperty → token
├── SettingsPage.tsx                          # изменение: getBoardProperty, updateBoardProperty → tokens

src/features/field-limits/
├── module.ts                                 # изменение: getBoardEditData → token

src/swimlane-wip-limits/
├── module.ts                                 # изменение: getBoardEditData → token

src/issue/
├── MarkFlaggedIssues.ts                      # изменение: loadFlaggedIssues, loadNewIssueViewEnabled → tokens
```

## Что сделать

1. Добавить 3 новых типа и токена в `src/shared/di/jiraApiTokens.ts`
2. Зарегистрировать новые токены в `registerJiraApiInDI`
3. Заменить прямые импорты `getBoardProperty` на `getBoardPropertyToken` (4 файла)
4. Заменить прямой импорт `updateBoardProperty` на `updateBoardPropertyToken` (1 файл)
5. Заменить прямой импорт `searchUsers` на `searchUsersToken` (1 файл)
6. Заменить прямой импорт `getBoardEditData` на `getBoardEditDataToken` (2 файла)
7. Заменить прямые импорты `loadFlaggedIssues`, `loadNewIssueViewEnabled` на токены (1 файл)

## Критерии приёмки

- [ ] 3 новых токена созданы и зарегистрированы в `registerJiraApiInDI`
- [ ] Нет прямых импортов `getBoardProperty`, `updateBoardProperty`, `searchUsers` из `jiraApi.ts` (кроме `jiraApiTokens.ts`)
- [ ] Нет прямых импортов `getBoardEditData`, `loadFlaggedIssues`, `loadNewIssueViewEnabled` из `jiraApi.ts`
- [ ] Допускается импорт типов (`type { JiraUser }`) из `jiraApi.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Нет зависимостей от других задач
- Референс: `src/shared/di/jiraApiTokens.ts` — существующий паттерн регистрации
- Блокирует: [TASK-173](./TASK-173-store-actions-eliminate-global-container.md) — store actions используют эти функции
