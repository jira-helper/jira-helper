# TASK-177: BlurSensitive → Service с DI

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Текущий `blurSensitive.ts` — набор standalone функций с прямым import синглтона `extensionApiService`. По архитектуре это **Service** (side effects: extension messaging, DOM, localStorage). Нужно вынести в класс `BlurSensitiveFeature` с интерфейсом, DI-токеном и constructor DI.

## Текущее состояние

```typescript
// src/blur-for-sensitive/blurSensitive.ts
import { extensionApiService } from '../shared/ExtensionApiService';

export const initBlurSensitive = (): void => {
  extensionApiService.onMessage(...);
  extensionApiService.onMessage(...);
};

export const setUpBlurSensitiveOnPage = (): void => { ... };
```

**Side effects**: `extensionApiService.onMessage()`, `document.getElementsByTagName()`, `localStorage`, `classList.add/remove`

**Потребитель**: `content.ts` — вызывает `initBlurSensitive()` и `setUpBlurSensitiveOnPage()`

## Целевая структура

```
src/blur-for-sensitive/
├── IBlurSensitiveFeature.ts     # интерфейс
├── BlurSensitiveFeature.ts      # класс с constructor DI
├── tokens.ts                    # токен + registerInDI
├── blurSensitive.css            # без изменений
└── index.ts                     # экспорт
```

## Целевой код

### IBlurSensitiveFeature.ts

```typescript
export interface IBlurSensitiveFeature {
  init(): void;
  setUpOnPage(): void;
}
```

### BlurSensitiveFeature.ts

```typescript
import type { IExtensionApiService } from '../shared/ExtensionApiService';
import type { IBlurSensitiveFeature } from './IBlurSensitiveFeature';
import './blurSensitive.css';

type MessageRequest = { blurSensitive?: boolean; getBlurSensitive?: boolean };
type MessageResponse = { blurSensitive: boolean };

export class BlurSensitiveFeature implements IBlurSensitiveFeature {
  constructor(private extensionApi: IExtensionApiService) {}

  private setBlurSensitive(isBlur: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    if (isBlur) {
      html.classList.add('jh-blur');
    } else {
      html.classList.remove('jh-blur');
    }
  }

  private changeBlurSensitive(isBlur: boolean, sendResponse: (response: MessageResponse) => void): void {
    localStorage.setItem('blurSensitive', String(isBlur));
    this.setBlurSensitive(isBlur);
    sendResponse({ blurSensitive: isBlur });
  }

  init(): void {
    this.extensionApi.onMessage(
      (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
        if (!sender.tab && typeof request.blurSensitive === 'boolean') {
          this.changeBlurSensitive(request.blurSensitive, sendResponse);
        }
      }
    );

    this.extensionApi.onMessage(
      (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
        if (!sender.tab && typeof request.getBlurSensitive === 'boolean') {
          sendResponse({ blurSensitive: localStorage.getItem('blurSensitive') === 'true' });
        }
      }
    );
  }

  setUpOnPage(): void {
    const isBlur = localStorage.getItem('blurSensitive') === 'true';
    this.setBlurSensitive(isBlur);
  }
}
```

### tokens.ts

```typescript
import { Token } from 'dioma';
import type { IBlurSensitiveFeature } from './IBlurSensitiveFeature';

export const blurSensitiveFeatureToken = new Token<IBlurSensitiveFeature>('blurSensitiveFeature');
```

### BlurSensitiveFeature.ts (registerInDI)

```typescript
// в конце файла, рядом с реализацией
export const registerBlurSensitiveFeatureInDI = (container: Container) => {
  const extensionApi = container.inject(extensionApiServiceToken);
  container.register({
    token: blurSensitiveFeatureToken,
    value: new BlurSensitiveFeature(extensionApi),
  });
};
```

### Изменения в content.ts

**До**:
```typescript
import { setUpBlurSensitiveOnPage, initBlurSensitive } from './blur-for-sensitive/blurSensitive';

initBlurSensitive();
// ...
setUpBlurSensitiveOnPage();
```

**После**:
```typescript
import { blurSensitiveFeatureToken } from './blur-for-sensitive/tokens';

const blurSensitiveFeature = globalContainer.inject(blurSensitiveFeatureToken);
blurSensitiveFeature.init();
// ...
blurSensitiveFeature.setUpOnPage();
```

## Что сделать

1. Создать `IBlurSensitiveFeature.ts` — интерфейс
2. Создать `BlurSensitiveFeature.ts` — класс с constructor DI от `IExtensionApiService`
3. Создать `tokens.ts` — токен + `registerBlurSensitiveFeatureInDI`
4. Создать `index.ts` — реэкспорт
5. Вызвать `registerBlurSensitiveFeatureInDI` в `initDiContainer()`
6. В `content.ts` — заменить на `globalContainer.inject(blurSensitiveFeatureToken).init()`
7. Удалить старый `blurSensitive.ts`

## Критерии приёмки

- [ ] Интерфейс `IBlurSensitiveFeature` создан
- [ ] Токен `blurSensitiveFeatureToken` экспортируется из `tokens.ts`
- [ ] `BlurSensitiveFeature` получает `IExtensionApiService` через constructor DI
- [ ] `registerBlurSensitiveFeatureInDI` вызывается в `initDiContainer()`
- [ ] `content.ts` использует `globalContainer.inject(blurSensitiveFeatureToken)`
- [ ] Старый `blurSensitive.ts` удалён
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

- Создан интерфейс `IBlurSensitiveFeature` с методами `init()` и `setUpOnPage()`
- Создан класс `BlurSensitiveFeature` с constructor DI от `IExtensionApiService`
- Создан токен `blurSensitiveFeatureToken` в `tokens.ts`
- Добавлена `registerBlurSensitiveFeatureInDI` в `initDiContainer()` в `content.ts`
- `content.ts` использует `globalContainer.inject(blurSensitiveFeatureToken)`
- Старый `blurSensitive.ts` удалён
- Добавлены 5 unit-тестов для `BlurSensitiveFeature`

**Проблемы и решения**:

Нет.
