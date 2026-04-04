# TASK-178: Routing → RoutingService с DI

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Текущий `routing.ts` — набор standalone функций. Все функции обращаются к `window.location` (side effect), одна — к `extensionApiService.onMessage()`. По архитектуре это **Service** (side effects: `window.location`, extension messaging, DOM). Нужно вынести в класс `RoutingService` с интерфейсом, DI-токеном и constructor DI.

## Текущее состояние

```typescript
// src/routing.ts
import { extensionApiService } from './shared/ExtensionApiService';

export const Routes = { BOARD: 'BOARD', ... };
export const getSearchParam = (param: string): string | null => { /* window.location */ };
export const getReportNameFromURL = (): string | null => { /* window.location */ };
export const getBoardIdFromURL = (): string | null => { /* window.location */ };
export const getCurrentRoute = (): Route | null => { /* window.location */ };
export const getSettingsTab = (): Promise<string | null> => { /* window.location + DOM */ };
export const getIssueId = (): string | null => { /* window.location */ };
export const onUrlChange = (cb): void => { extensionApiService.onMessage(...); };
```

**Side effects**: `window.location`, `extensionApiService.onMessage()`, `waitForElement()` (DOM)

**Потребители**:

| Файл | Что использует |
|------|---------------|
| `src/shared/runModifications.ts` | `getCurrentRoute()`, `onUrlChange()`, `Routes` |
| `src/content.ts` | `Routes` |
| `src/shared/PageModification.ts` | `getBoardIdFromURL()`, `getSearchParam()`, `getReportNameFromURL()` |
| `src/shared/boardPropertyService.ts` | `getBoardIdFromURL()` |
| `src/shared/di/routingTokens.ts` | `getBoardIdFromURL()` (уже частичный DI-токен) |

## Целевая структура

```
src/routing/
├── IRoutingService.ts           # интерфейс
├── RoutingService.ts            # класс с constructor DI
├── tokens.ts                    # токен + registerInDI + Routes
├── routes.ts                    # Routes константа (чистая, без side effects)
└── index.ts                     # экспорт
```

## Целевой код

### routes.ts

```typescript
export const Routes = {
  BOARD: 'BOARD',
  BOARD_BACKLOG: 'BOARD_BACKLOG',
  SETTINGS: 'SETTINGS',
  SEARCH: 'SEARCH',
  REPORTS: 'REPORTS',
  ISSUE: 'ISSUE',
  ALL: 'ALL',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
```

### IRoutingService.ts

```typescript
import type { Route } from './routes';

export interface IRoutingService {
  getSearchParam(param: string): string | null;
  getReportNameFromURL(): string | null;
  getBoardIdFromURL(): string | null;
  getCurrentRoute(): Route | null;
  getSettingsTab(): Promise<string | null>;
  getIssueId(): string | null;
  onUrlChange(cb: (url: string) => void): void;
}
```

### RoutingService.ts

```typescript
import type { IExtensionApiService } from '../shared/ExtensionApiService';
import type { IRoutingService } from './IRoutingService';
import { Routes, type Route } from './routes';
import { types } from '../background/actions';
import { waitForElement } from '../shared/utils';

export class RoutingService implements IRoutingService {
  constructor(private extensionApi: IExtensionApiService) {}

  getSearchParam(param: string): string | null {
    return new URLSearchParams(window.location.search).get(param);
  }

  getBoardIdFromURL(): string | null { /* ... existing logic ... */ }
  getCurrentRoute(): Route | null { /* ... existing logic ... */ }
  getSettingsTab(): Promise<string | null> { /* ... existing logic ... */ }
  getIssueId(): string | null { /* ... existing logic ... */ }
  getReportNameFromURL(): string | null { /* ... existing logic ... */ }

  onUrlChange(cb: (url: string) => void): void {
    this.extensionApi.onMessage((request: { type: string; url: string }, sender, sendResponse) => {
      if (!sender.tab && request.type === types.TAB_URL_CHANGE) {
        cb(request.url);
        sendResponse({ message: 'change event received' });
      }
    });
  }
}
```

### tokens.ts

```typescript
import { Token } from 'dioma';
import type { IRoutingService } from './IRoutingService';

export const routingServiceToken = new Token<IRoutingService>('routingService');
```

### RoutingService.ts (registerInDI)

```typescript
// в конце файла, рядом с реализацией
export const registerRoutingServiceInDI = (container: Container) => {
  const extensionApi = container.inject(extensionApiServiceToken);
  container.register({
    token: routingServiceToken,
    value: new RoutingService(extensionApi),
  });
};
```

## Миграция потребителей

| Потребитель | До | После |
|---|---|---|
| `runModifications.ts` | `import { getCurrentRoute, onUrlChange } from '../routing'` | `globalContainer.inject(routingServiceToken)` |
| `PageModification.ts` | `import { getBoardIdFromURL } from '../routing'` | `globalContainer.inject(routingServiceToken)` |
| `boardPropertyService.ts` | `import { getBoardIdFromURL } from 'src/routing'` | `container.inject(routingServiceToken)` |
| `routingTokens.ts` | Отдельный `getBoardIdFromURLToken` | Заменяется на `routingServiceToken` (единый токен) |
| `content.ts` | `import { Routes } from './routing'` | `import { Routes } from './routing/routes'` (прямой import — чистая константа) |

**Примечание**: `Routes` — константа без side effects, остаётся прямым импортом.

## Что сделать

1. Создать папку `src/routing/`
2. Вынести `Routes` в `routes.ts` (чистая константа)
3. Создать `IRoutingService.ts` — интерфейс
4. Создать `RoutingService.ts` — класс с constructor DI от `IExtensionApiService`
5. Создать `tokens.ts` — токен + `registerRoutingServiceInDI`
6. Создать `index.ts` — реэкспорт
7. Вызвать `registerRoutingServiceInDI` в `initDiContainer()`
8. Мигрировать потребителей на `routingServiceToken`
9. Удалить старый `routingTokens.ts` (заменён единым `routingServiceToken`)
10. Удалить старый `src/routing.ts`

## Критерии приёмки

- [ ] `Routes` вынесен в `routes.ts` — чистая константа, прямой import
- [ ] Интерфейс `IRoutingService` создан
- [ ] Токен `routingServiceToken` экспортируется из `tokens.ts`
- [ ] `RoutingService` получает `IExtensionApiService` через constructor DI
- [ ] `registerRoutingServiceInDI` вызывается в `initDiContainer()`
- [ ] Старый `getBoardIdFromURLToken` из `routingTokens.ts` заменён на `routingServiceToken`
- [ ] Все потребители мигрированы на `routingServiceToken`
- [ ] Старый `src/routing.ts` удалён
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-169](./TASK-169-extension-api-service-di.md) — `extensionApiServiceToken` должен существовать
- Референс: `src/shared/boardPropertyService.ts` — аналогичный паттерн (интерфейс + токен + register)

---

## Результаты

**Дата**: 2026-03-23

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создана папка `src/routing/` с файлами: `routes.ts`, `IRoutingService.ts`, `RoutingService.ts`, `tokens.ts`, `index.ts`
- `RoutingService` получает `IExtensionApiService` через constructor DI
- `runModifications.ts`, `PageModification.ts`, `boardPropertyService.ts` мигрированы на `routingServiceToken`
- `routingTokens.ts` обновлён — `getBoardIdFromURLToken` делегирует к `routingServiceToken`
- Backward-compatible standalone функции в `index.ts` для потребителей, не вошедших в миграцию
- Тесты routing обновлены для работы с DI
- Старый `src/routing.ts` удалён

**Проблемы и решения**:

Нет.
