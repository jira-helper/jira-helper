# TASK-14-7: DI Module для WIP Limits

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-5, TASK-14-6

---

## Цель

Создать DI module для регистрации всех моделей фичи swimlane-wip-limits.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/module.ts` | Создание |
| `src/swimlane-wip-limits/module.test.ts` | Создание |
| `src/swimlane-wip-limits/tokens.ts` | Изменение (добавить все токены) |
| `src/swimlane-wip-limits/index.ts` | Создание |

---

## Требуемые изменения

### 1. tokens.ts

Все токены с паттерном `{ model, useModel }`:

```typescript
import { Token } from 'dioma';
import { useSnapshot } from 'valtio';
import { useDi } from '@/shared/di/react';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';

// PropertyModel
export const propertyModelToken = new Token<{
  model: Readonly<PropertyModel>;
  useModel: () => Readonly<PropertyModel>;
}>('swimlane-wip-limits/propertyModel');

// SettingsUIModel
export const settingsUIModelToken = new Token<{
  model: Readonly<SettingsUIModel>;
  useModel: () => Readonly<SettingsUIModel>;
}>('swimlane-wip-limits/settingsUIModel');

// BoardRuntimeModel
export const boardRuntimeModelToken = new Token<{
  model: Readonly<BoardRuntimeModel>;
  useModel: () => Readonly<BoardRuntimeModel>;
}>('swimlane-wip-limits/boardRuntimeModel');
```

### 2. module.ts

```typescript
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
import { globalContainer } from '@/shared/di';
import { useDi } from '@/shared/di/react';
import { propertyModelToken, settingsUIModelToken, boardRuntimeModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { boardPropertyServiceToken } from '@/shared/services/BoardPropertyService';
import { boardServiceToken } from '@/shared/services/BoardService';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from '@/shared/Logger';

export function registerSwimlaneWipLimitsModule(container = globalContainer) {
  // PropertyModel (singleton)
  container.register({
    token: propertyModelToken,
    factory: () => {
      const boardPropertyService = container.inject(boardPropertyServiceToken);
      const logger = container.inject(loggerToken);
      
      const model = proxy(new PropertyModel(boardPropertyService, logger));
      
      return {
        model,
        useModel: () => {
          useSnapshot(model);
          return model;
        },
      };
    },
    scope: 'singleton',
  });

  // SettingsUIModel (singleton)
  container.register({
    token: settingsUIModelToken,
    factory: () => {
      const { model: propertyModel } = container.inject(propertyModelToken);
      const boardService = container.inject(boardServiceToken);
      const logger = container.inject(loggerToken);
      
      const model = proxy(new SettingsUIModel(
        propertyModel as PropertyModel,
        boardService,
        logger,
      ));
      
      return {
        model,
        useModel: () => {
          useSnapshot(model);
          return model;
        },
      };
    },
    scope: 'singleton',
  });

  // BoardRuntimeModel (singleton)
  container.register({
    token: boardRuntimeModelToken,
    factory: () => {
      const { model: propertyModel } = container.inject(propertyModelToken);
      const pageObject = container.inject(boardPagePageObjectToken);
      const logger = container.inject(loggerToken);
      
      const model = proxy(new BoardRuntimeModel(
        propertyModel as PropertyModel,
        pageObject,
        logger,
      ));
      
      return {
        model,
        useModel: () => {
          useSnapshot(model);
          return model;
        },
      };
    },
    scope: 'singleton',
  });
}
```

### 3. Integration тест

```typescript
import { createTestContainer } from '@/test-utils/createTestContainer';
import { registerSwimlaneWipLimitsModule } from './module';
import { propertyModelToken, boardRuntimeModelToken } from './tokens';

describe('Swimlane WIP Limits Module', () => {
  it('should initialize runtime model with property settings', async () => {
    const container = createTestContainer();
    // ... setup mocks ...
    registerSwimlaneWipLimitsModule(container);
    
    const { model: runtimeModel } = container.inject(boardRuntimeModelToken);
    await runtimeModel.initialize();
    
    expect(runtimeModel.isInitialized).toBe(true);
  });
});
```

---

## Acceptance Criteria

- [ ] Все токены созданы с паттерном `{ model, useModel }`
- [ ] `registerSwimlaneWipLimitsModule()` регистрирует все модели
- [ ] Модели создаются как singletons
- [ ] Integration тест проходит
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — секция "DI Registration"
- `src/column-limits/module.ts` — пример DI module

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Добавлены токены `settingsUIModelToken` и `boardRuntimeModelToken`
- Создан `registerSwimlaneWipLimitsModule()` для регистрации всех моделей
- Модели обёрнуты в `proxy()` из valtio для реактивности
- Добавлена зависимость `valtio` в package.json
- 4 интеграционных теста

**Проблемы и решения**:

**Проблема 1: Кеширование factory в dioma**

Контекст: Dioma вызывает factory при каждом inject без кеша

Решение: WeakMap для кеширования по контейнеру
