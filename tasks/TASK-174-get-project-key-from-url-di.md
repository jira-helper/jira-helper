# TASK-174: getProjectKeyFromURL → RoutingService

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Функция `getProjectKeyFromURL` в `src/shared/utils/getProjectKeyFromURL.ts` читает `window.location` для извлечения ключа проекта из URL. Это side effect — зависимость от браузерного окружения.

Аналогичные функции (`getBoardIdFromURL`, `getIssueId`, `getSearchParam`, `getSettingsTab`) уже являются методами `RoutingService`. `getProjectKeyFromURL` — та же категория (парсинг URL), поэтому должна быть методом `RoutingService`, а не отдельным токеном.

## Сущность

**Функция**: `getProjectKeyFromURL()` (`src/shared/utils/getProjectKeyFromURL.ts`)

**Side effects**: Чтение `window.location.search`, `window.location.pathname`

**Правильное место**: `RoutingService` (по аналогии с `getBoardIdFromURL`, `getIssueId` и т.д.)

## Анализ потребителей

### Прямые потребители

| Файл | Использование | DI в скоупе? | Замена |
|------|--------------|-------------|--------|
| `src/shared/utils/issueTypeSelector.ts` (L52) | `getProjectKeyFromURL()` в `loadIssueTypes()` | Да — `globalContainer` уже импортирован | `globalContainer.inject(routingServiceToken).getProjectKeyFromURL()` |
| `src/shared/utils/issueTypeSelector.ts` (L337) | `getProjectKeyFromURL()` в `initIssueTypeSelector()` | Да — `globalContainer` уже импортирован | `globalContainer.inject(routingServiceToken).getProjectKeyFromURL()` |
| `src/shared/components/IssueTypeSelector.tsx` (L62) | `getProjectKeyFromURL()` в `useState` инициализации | Да — рендерится внутри `WithDi` | `useDi().inject(routingServiceToken).getProjectKeyFromURL()` |

### Транзитивные потребители (через `IssueTypeSelector`)

- `swimlane-wip-limits/SettingsPage/components/SwimlaneSettingRow.tsx` — внутри `WithDi`
- `person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` — внутри `WithDi`
- `column-limits/SettingsPage/ColumnLimitsForm.tsx` — внутри `WithDi`

**Вывод**: Все потребители уже имеют DI-контейнер в скоупе. Замена безболезненная.

## Что сделать

### 1. Добавить метод в `IRoutingService` и `RoutingService`

**`src/routing/IRoutingService.ts`**:

```typescript
export interface IRoutingService {
  // ... existing methods ...
  getProjectKeyFromURL(): string | null;
}
```

**`src/routing/RoutingService.ts`** — перенести логику из `getProjectKeyFromURL.ts`:

```typescript
getProjectKeyFromURL(): string | null {
  const searchParams = new URLSearchParams(window.location.search);

  const projectKeyFromQuery = searchParams.get('projectKey');
  if (projectKeyFromQuery) {
    return projectKeyFromQuery;
  }

  const match = window.location.pathname.match(/\/projects\/([A-Z]+)\//i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}
```

### 2. Заменить прямые импорты

**`issueTypeSelector.ts`** — заменить оба вызова:

```typescript
// Было:
import { getProjectKeyFromURL } from './getProjectKeyFromURL';
const projectKey = getProjectKeyFromURL();

// Стало:
import { routingServiceToken } from 'src/routing';
const projectKey = globalContainer.inject(routingServiceToken).getProjectKeyFromURL();
```

**`IssueTypeSelector.tsx`** — использовать `useDi()`:

```typescript
// Было:
import { getProjectKeyFromURL } from '../utils/getProjectKeyFromURL';
const [projectKey, setProjectKey] = useState(initialProjectKey || getProjectKeyFromURL() || '');

// Стало:
import { routingServiceToken } from 'src/routing';
const container = useDi();
const [projectKey, setProjectKey] = useState(
  initialProjectKey || container.inject(routingServiceToken).getProjectKeyFromURL() || ''
);
```

### 3. Удалить standalone файл

Удалить `src/shared/utils/getProjectKeyFromURL.ts` (логика перенесена в `RoutingService`).

### 4. Обновить тесты

- `getProjectKeyFromURL.test.ts` — перенести тесты в тесты `RoutingService` или адаптировать
- `issueTypeSelector.test.ts` — мокать `routingServiceToken` вместо `getProjectKeyFromURL`
- `IssueTypeSelector.test.tsx` — мокать `routingServiceToken` вместо `getProjectKeyFromURL`

## Файлы

```
src/routing/
├── IRoutingService.ts          # изменение: + getProjectKeyFromURL()
├── RoutingService.ts           # изменение: + getProjectKeyFromURL()

src/shared/utils/
├── getProjectKeyFromURL.ts     # удалить (логика в RoutingService)
├── issueTypeSelector.ts        # изменение: routingServiceToken вместо прямого import

src/shared/components/
├── IssueTypeSelector.tsx       # изменение: useDi().inject(routingServiceToken)
```

## Критерии приёмки

- [x] `getProjectKeyFromURL()` — метод `IRoutingService` / `RoutingService`
- [x] Нет прямых импортов `getProjectKeyFromURL` (кроме тестов самого `RoutingService`)
- [x] `src/shared/utils/getProjectKeyFromURL.ts` удалён
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:typescript`

## Зависимости

- Зависит от: TASK-178 (RoutingService уже создан)
- Референс: существующие методы `RoutingService` (`getBoardIdFromURL`, `getIssueId`)
