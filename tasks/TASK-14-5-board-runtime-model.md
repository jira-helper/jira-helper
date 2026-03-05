# TASK-14-5: BoardRuntimeModel

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-1, TASK-14-3

---

## Цель

Создать `BoardRuntimeModel` — Valtio модель для управления отображением WIP-лимитов на BoardPage.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.ts` | Создание |
| `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.test.ts` | Создание |
| `src/swimlane-wip-limits/BoardPage/models/index.ts` | Создание |

---

## Требуемые изменения

### 1. BoardRuntimeModel

```typescript
import { proxy } from 'valtio';
import type { IBoardPagePageObject, SwimlaneElement } from 'src/page-objects/BoardPage';
import type { PropertyModel } from '../../property/PropertyModel';
import type { SwimlaneSettings, SwimlaneSetting } from '../../types';

export interface SwimlaneStats {
  count: number;
  limit: number;
  exceeded: boolean;
}

export class BoardRuntimeModel {
  isInitialized = false;
  swimlaneStats: Map<string, SwimlaneStats> = new Map();

  constructor(
    private propertyModel: PropertyModel,
    private pageObject: IBoardPagePageObject,
    private logger: ILogger,
  ) {}

  /** Инициализация: загрузка настроек и первый рендер */
  async initialize(): Promise<void>;

  /** Пересчитать и отрендерить badges */
  render(): void;

  /** Подсчёт статистики для swimlane с учётом выбранных колонок */
  calculateStats(swimlaneId: string, setting: SwimlaneSetting): SwimlaneStats;

  /** Cleanup */
  dispose(): void;
}
```

### 2. calculateStats с учётом колонок

```typescript
calculateStats(swimlaneId: string, setting: SwimlaneSetting): SwimlaneStats {
  const columns = setting.columns.length > 0 
    ? setting.columns 
    : this.pageObject.getColumns(); // все колонки
  
  const count = this.pageObject.getIssueCountForColumns(swimlaneId, columns);
  const limit = setting.limit ?? Infinity;
  
  return {
    count,
    limit,
    exceeded: count > limit,
  };
}
```

---

## Acceptance Criteria

- [ ] Модель реализует initialize/render/calculateStats/dispose
- [ ] `calculateStats()` корректно обрабатывает пустой `columns` (= все)
- [ ] `calculateStats()` корректно обрабатывает заданный `columns`
- [ ] Тесты с мокнутым PageObject и PropertyModel
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация BoardRuntimeModel
- `src/swimlane/SwimlaneLimits.ts` — legacy логика подсчёта

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `BoardRuntimeModel` с методами `initialize`, `render`, `calculateStats`, `destroy`, `reset`
- Добавлены query-методы: `getSwimlaneStats`, `isOverLimit`, `getBadgeText`
- Создана структура папок `BoardPage/models/`
- 12 unit-тестов с моками

**Проблемы и решения**:

**Проблема 1: Logger интерфейс**

Контекст: В проекте нет `ILogger`, используется класс `Logger`

Решение: Использован тип `Logger` напрямую
