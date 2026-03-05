# TASK-14-3: Types + tokens + PropertyModel для WIP Limits

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-1

---

## Цель

Создать foundation для фичи swimlane-wip-limits: типы, DI-токены и PropertyModel.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/types.ts` | Создание |
| `src/swimlane-wip-limits/tokens.ts` | Создание |
| `src/swimlane-wip-limits/property/PropertyModel.ts` | Создание |
| `src/swimlane-wip-limits/property/PropertyModel.test.ts` | Создание |
| `src/swimlane-wip-limits/property/index.ts` | Создание |
| `src/swimlane-wip-limits/utils/mergeSwimlaneSettings.ts` | Создание |
| `src/swimlane-wip-limits/utils/mergeSwimlaneSettings.test.ts` | Создание |

---

## Требуемые изменения

### 1. types.ts

```typescript
export interface SwimlaneSetting {
  limit?: number;
  /** Колонки для подсчёта. Пустой массив = все колонки */
  columns: string[];
  includedIssueTypes?: string[];
}

export interface SwimlaneSettings {
  [swimlaneId: string]: SwimlaneSetting;
}

export interface Swimlane {
  id: string;
  name: string;
}

export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';
```

### 2. tokens.ts

Паттерн `{ model, useModel }`:

```typescript
import { Token } from 'dioma';
import { useSnapshot } from 'valtio';
import { useDi } from '@/shared/di/react';
import type { PropertyModel } from './property/PropertyModel';

export const propertyModelToken = new Token<{
  model: Readonly<PropertyModel>;
  useModel: () => Readonly<PropertyModel>;
}>('swimlane-wip-limits/propertyModel');
```

### 3. PropertyModel

Valtio class-based model:

```typescript
import { proxy } from 'valtio';
import type { Result } from 'ts-results';
import type { SwimlaneSettings, LoadingState } from '../types';
import type { IBoardPropertyService } from '@/shared/services/BoardPropertyService';
import type { ILogger } from '@/shared/Logger';

const PROPERTY_KEY = 'jiraHelperSwimlaneLimits';

export class PropertyModel {
  settings: SwimlaneSettings = {};
  state: LoadingState = 'initial';
  error: string | null = null;

  constructor(
    private boardPropertyService: IBoardPropertyService,
    private logger: ILogger,
  ) {}

  async load(): Promise<Result<SwimlaneSettings, Error>> { ... }
  async save(settings: SwimlaneSettings): Promise<Result<void, Error>> { ... }
  reset(): void { ... }
}
```

### 4. mergeSwimlaneSettings.ts

Утилита для миграции старых настроек (без `columns`):

```typescript
export function mergeSwimlaneSettings(
  saved: Partial<SwimlaneSettings>,
  swimlanes: Swimlane[],
): SwimlaneSettings {
  // Добавить columns: [] для старых настроек без этого поля
}
```

---

## Acceptance Criteria

- [ ] Все типы созданы с JSDoc
- [ ] PropertyModel реализует load/save/reset
- [ ] Используется `ts-results` для Result
- [ ] Тесты на PropertyModel (load success/error, save success/error, reset)
- [ ] Тесты на mergeSwimlaneSettings (миграция старых данных)
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — полная спецификация типов и PropertyModel
- `src/column-limits/BoardPage/stores/runtimeStore.ts` — пример Valtio store

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `types.ts` с типами: `SwimlaneSetting`, `SwimlaneSettings`, `Swimlane`, `SwimlaneIssueStats`, `LoadingState`, `BoardData`, `LimitBadgeProps`
- Создан `tokens.ts` с DI-токеном `propertyModelToken`
- Создан `PropertyModel` с методами `load`, `save`, `updateSwimlane`, `reset`
- Создан `mergeSwimlaneSettings` для объединения legacy и новых настроек
- 8 тестов для PropertyModel, 5 тестов для mergeSwimlaneSettings

**Проблемы и решения**:

**Проблема 1: valtio не в зависимостях**

Контекст: valtio не установлен в проекте

Решение: В тестах используется обычный экземпляр без `proxy()`

**Проблема 2: Не экспортированные интерфейсы**

Контекст: `Logger` и `BoardPropertyServiceI` не экспортировались

Решение: Добавлен `export` в `Logger.ts` и `boardPropertyService.ts`
