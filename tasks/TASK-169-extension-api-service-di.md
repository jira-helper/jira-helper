# TASK-169: ExtensionApiService → DI token

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

`ExtensionApiService` — сервис-обёртка над chrome/browser Extension API. Экспортируется как голый синглтон `extensionApiService = new ExtensionApiService()`. Имеет side effects: chrome API, `navigator.userAgent`, tabs, messaging. Нет DI-токена, нет интерфейса — невозможно мокировать в тестах.

## Сущность

**Класс**: `ExtensionApiService` (src/shared/ExtensionApiService.ts)

**Side effects**: `chrome.*` / `browser.*` API, `navigator.userAgent`, tabs management, context menus, messaging

**Текущий экспорт**: `export const extensionApiService = new ExtensionApiService()` — голый синглтон

## Кто и как использует

| Файл | Что использует | Контекст |
|------|---------------|----------|
| `src/content.ts` | `sendMessage()` | Уведомление background при инициализации |
| `src/background/background.ts` | `onTabsUpdated()`, `checkTabURLByPattern()`, `sendMessageToTab()`, `addContextMenuListener()`, `createContextMenu()`, `removeAllContextMenus()`, `onMessage()` | Весь background-скрипт |
| `src/routing.ts` | `onMessage()` | Роутинг по URL |
| `src/issue/MarkFlaggedIssues.ts` | `getUrl()` | Получение URL иконки флага |
| `src/blur-for-sensitive/blurSensitive.ts` | `onMessage()` | Подписка на сообщения blur |
| `src/charts/AddChartGrid.ts` | `isFirefox()` | Проверка браузера |
| `src/shared/components/Image.tsx` | `extensionApiService.getUrl()` | Получение URL ресурсов расширения |

## Какие токены надо экспортировать

```typescript
// src/shared/ExtensionApiService.ts

export interface IExtensionApiService {
  isFirefox(): boolean;
  getUrl(resource: string): string;
  onMessage(cb: MessageCallback): void;
  onTabsUpdated(cb: (tabId: number, changeInfo: TabChangeInfo) => any): void;
  onTabsActivated(cb: TabsActivatedCallback): void;
  checkTabURLByPattern(tabId: number, regexp: RegExp): Promise<{ result: boolean; url: string }>;
  sendMessageToTab(tabId: number, message: any, response?: (res: any) => void): Promise<void>;
  removeAllContextMenus(cb?: () => void): void;
  addContextMenuListener(cb: ContextMenuCallback): void;
  createContextMenu(config: ContextMenuConfig): void;
  sendMessage(payload: { message: string }): Promise<void>;
}

export const extensionApiServiceToken = new Token<IExtensionApiService>('extensionApiService');
```

**Регистрация**:

```typescript
export const registerExtensionApiServiceInDI = (container: Container) => {
  container.register({
    token: extensionApiServiceToken,
    value: new ExtensionApiService(),
  });
};
```

## Анализ потребителей

### Группа 1: background.ts — оставить как есть

`background.ts` использует `extensionApiService` в module-level scope (14+ вызовов, top-level код). DI-контейнер в background-контексте не существует. **Решение: оставить прямой import синглтона**. Экспорт синглтона `extensionApiService` сохраняется для background.

### Группа 2: content.ts — composition root

`content.ts` — точка входа (composition root). Текущий порядок:
- `initBlurSensitive()` — вызов **ДО** `initDiContainer()` (line 67)
- `extensionApiService.sendMessage()` — вызов **ДО** `initDiContainer()` (line 68)
- `await domLoaded()` (line 70)
- `initDiContainer()` — регистрация DI (line 71)
- `runModifications()` — вызов **ПОСЛЕ** `initDiContainer()` (line 113)

**Проблема**: DI-регистрации происходят поздно (после `domLoaded`), а ранние потребители вынуждены использовать прямой import синглтона.

**Решение**: Перенести **все** DI-регистрации первой строкой после `!isJira`. Регистрация — дешёвая операция (особенно с `factory:`). После этого фичи сами достают зависимости из `globalContainer`:

```typescript
async function start() {
  if (!isJira) return;

  // 1. Все DI-регистрации — первым делом
  initDiContainer();

  // 2. Достаём из контейнера фичи, которые надо инициировать рано
  const blurSensitiveFeature = globalContainer.inject(blurSensitiveFeatureToken);
  const extensionApi = globalContainer.inject(extensionApiServiceToken);

  blurSensitiveFeature.init();
  extensionApi.sendMessage({ message: 'jira-helper-inited' });

  await domLoaded();

  loadLocalSettings();
  blurSensitiveFeature.setUpOnPage();

  runModifications(modificationsMap);
}
```

`content.ts` работает только с токенами — не знает реализаций.

### Группа 3: blurSensitive.ts → отдельная задача

Вынесено в [TASK-177](./TASK-177-blur-sensitive-service.md) — BlurSensitiveFeature Service с DI-токеном, constructor DI от `IExtensionApiService`.

### Группа 4: routing.ts → отдельная задача

Вынесено в [TASK-178](./TASK-178-routing-service.md) — RoutingService с DI-токеном, constructor DI от `IExtensionApiService`.

### Группа 5: PageModification subclasses — container.inject()

`MarkFlaggedIssues`, `AddChartGrid` — классы-наследники `PageModification`. Вызываются после DI init через `runModifications`.

**Решение**: `container.inject(extensionApiServiceToken)` внутри методов (стандартный паттерн для PageModification).

### Группа 6: React-компоненты

`Image.tsx` — React-компонент.

**Решение**: `useDi().inject(extensionApiServiceToken)`.

## Как поменяется код

### Пример 1: PageModification subclass

**До**:
```typescript
import { extensionApiService } from '../shared/ExtensionApiService';
extensionApiService.getUrl('icons/flag.png');
```

**После**:
```typescript
import { extensionApiServiceToken } from '../shared/ExtensionApiService';
const extensionApi = globalContainer.inject(extensionApiServiceToken);
extensionApi.getUrl('icons/flag.png');
```

### Пример 2: React-компонент

**После**:
```typescript
const extensionApi = useDi().inject(extensionApiServiceToken);
```

## Файлы

```
src/shared/
├── ExtensionApiService.ts              # интерфейс + токен + регистрация (синглтон остаётся для background)
src/
├── content.ts                          # initDiContainer() первым делом
├── background/background.ts            # БЕЗ ИЗМЕНЕНИЙ (прямой import синглтона)
├── issue/MarkFlaggedIssues.ts          # globalContainer.inject(extensionApiServiceToken)
├── charts/AddChartGrid.ts              # globalContainer.inject(extensionApiServiceToken)
├── shared/components/Image.tsx         # useDi().inject(extensionApiServiceToken)
```

> `blurSensitive` и `routing` — в отдельных задачах: [TASK-177](./TASK-177-blur-sensitive-service.md), [TASK-178](./TASK-178-routing-service.md)

## Что сделать

1. Создать интерфейс `IExtensionApiService` в `ExtensionApiService.ts`
2. Создать токен `extensionApiServiceToken`
3. Создать функцию `registerExtensionApiServiceInDI`
4. В `content.ts` — перенести `initDiContainer()` первой строкой после `!isJira` (добавить туда `registerExtensionApiServiceInDI`)
5. `MarkFlaggedIssues.ts`, `AddChartGrid.ts` — `globalContainer.inject(extensionApiServiceToken)`
6. `Image.tsx` — `useDi().inject(extensionApiServiceToken)`
7. Синглтон `extensionApiService` **оставить** (нужен для `background.ts`)

> `blurSensitive` → [TASK-177](./TASK-177-blur-sensitive-service.md), `routing` → [TASK-178](./TASK-178-routing-service.md)

---

## Результаты

**Дата**: 2026-03-23

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан интерфейс `IExtensionApiService` с полной типизацией всех публичных методов, вынесен тип `ContextMenuConfig`
- Создан DI-токен `extensionApiServiceToken` и функция `registerExtensionApiServiceInDI`
- `initDiContainer()` в `content.ts` перенесён первой строкой после `!isJira`, включает регистрацию `extensionApiService`
- `MarkFlaggedIssues.ts` — `getFlag` принимает `IExtensionApiService` параметром, `apply()` инжектит через `globalContainer`
- `AddChartGrid.ts` — `apply()` инжектит через `globalContainer`
- `Image.tsx` — использует `useDi().inject(extensionApiServiceToken)`
- Добавлена регистрация `extensionApiServiceToken` в `.storybook/preview.tsx` для Storybook

**Проблемы и решения**:

Нет.

## Критерии приёмки

- [ ] Интерфейс `IExtensionApiService` создан
- [ ] Токен `extensionApiServiceToken` экспортируется
- [ ] `initDiContainer()` вызывается первой строкой после `!isJira` (включает `registerExtensionApiServiceInDI`)
- [ ] `background.ts` — без изменений, продолжает использовать синглтон
- [ ] `MarkFlaggedIssues.ts`, `AddChartGrid.ts` — используют `globalContainer.inject()`
- [ ] `Image.tsx` — использует `useDi().inject()`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Нет зависимостей от других задач
- Референс: `src/shared/boardPropertyService.ts` — аналогичный паттерн (интерфейс + токен + register)
