# TASK-182: BoardRuntimeModel + BoardRuntimeModel.test.ts

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Реализовать valtio `BoardRuntimeModel` — замену `useColumnLimitsRuntimeStore` и action-ов (`calculateGroupStats`, `styleColumnHeaders`, `styleColumnsWithLimits`, `applyLimits`). Модель читает `WipLimitsProperty` из `PropertyModel`, считает статистику и применяет стили **только** через `IBoardPagePageObject`. Обновить `tokens.ts` (`boardRuntimeModelToken`) и `module.ts` (регистрация модели).

## Файлы

```
src/column-limits/
├── tokens.ts              # добавить boardRuntimeModelToken
├── module.ts              # зарегистрировать BoardRuntimeModel (+ инжект boardPagePageObjectToken)
├── types.ts               # при необходимости: перенос GroupStats из runtimeStore.types.ts
└── BoardPage/models/
    ├── BoardRuntimeModel.ts       # новый
    ├── BoardRuntimeModel.test.ts  # новый (миграция с runtimeStore.test.ts, calculateGroupStats.test.ts)
    └── types.ts                   # новый — если GroupStats не в types.ts
```

## Интерфейс BoardRuntimeModel (из target-design)

```typescript
import type { WipLimitsProperty } from '../../types';
import type { GroupStats } from './types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';

export class BoardRuntimeModel {
  // === State ===
  groupStats: GroupStats[] = [];
  cssNotIssueSubTask: string = '';

  constructor(
    private propertyModel: PropertyModel,
    private pageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  // === Commands ===

  /**
   * Orchestrate full limit application:
   * 1. calculateStats() → groupStats
   * 2. applyColumnHeaderStyles() → group colors + borders
   * 3. applyLimitIndicators() → badges + over-limit highlights
   *
   * Call on init and on every DOM change (#ghx-pool mutation).
   */
  apply(): void;

  /**
   * Calculate statistics for all configured groups.
   * Reads property data, counts issues per column via pageObject.
   * @returns GroupStats array (also stored in this.groupStats)
   */
  calculateStats(): GroupStats[];

  /**
   * Apply group colors and borders to column headers.
   * Uses pageObject.styleColumnHeader() for DOM.
   */
  applyColumnHeaderStyles(): void;

  /**
   * Apply over-limit highlighting and insert N/M badges.
   * Uses pageObject.highlightColumnCells(), insertColumnHeaderHtml(),
   * removeColumnHeaderElements() for DOM.
   */
  applyLimitIndicators(): void;

  /** Set CSS selector for excluding subtasks. */
  setCssNotIssueSubTask(css: string): void;

  /** Reset to initial state. */
  reset(): void;
}
```

## Тип GroupStats (из target-design)

```typescript
export type GroupStats = {
  groupId: string;
  groupName: string;
  columns: string[];
  currentCount: number;
  limit: number;
  isOverLimit: boolean;
  color: string;
  ignoredSwimlanes: string[];
};
```

## Что сделать

1. Поместить `GroupStats` в `src/column-limits/types.ts` или `BoardPage/models/types.ts` (как в target-design); обновить импорты от `runtimeStore.types.ts`.
2. Реализовать `BoardRuntimeModel` с прямым import чистых функций из `shared/utils.ts` и т.д.; **без** прямого `document` — только `pageObject`.
3. Добавить `boardRuntimeModelToken` в `tokens.ts` (полная тройка токенов — вместе с `propertyModelToken` и будущим `settingsUIModelToken`; последний добавляется в TASK-184).
4. Зарегистрировать `BoardRuntimeModel` в `registerColumnLimitsModule` (инжект `boardPagePageObjectToken` из `src/page-objects/BoardPage`).
5. Перенести/написать unit-тесты по логике из `BoardPage/stores/runtimeStore.test.ts`, `BoardPage/actions/calculateGroupStats.test.ts`.

## Критерии приёмки

- [x] `BoardRuntimeModel` соответствует контракту; DOM только через `IBoardPagePageObject`.
- [x] `tokens.ts` содержит `boardRuntimeModelToken`; `module.ts` регистрирует модель.
- [x] Unit-тесты покрывают ключевую логику (stats, стилизация — с мок PO).
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от:
  - [TASK-179](./TASK-179-infrastructure.md) (tokens + module, PropertyModel)
  - [TASK-180](./TASK-180-property-model.md)
  - [TASK-181](./TASK-181-board-page-object.md) (методы PO)
- Референсы:
  - `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.ts`
  - `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.test.ts`
  - `src/features/field-limits/BoardPage/models/BoardRuntimeModel.ts`
  - `src/features/field-limits/BoardPage/models/BoardRuntimeModel.test.ts`
  - Legacy: `src/column-limits/BoardPage/stores/runtimeStore.ts`, `BoardPage/actions/*`

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `BoardPage/models/types.ts` (`GroupStats`), `BoardRuntimeModel.ts`, `BoardRuntimeModel.test.ts` (логика из `calculateGroupStats` + orchestration/стили с мок PO).
- `runtimeStore.types.ts` реэкспортирует `GroupStats` из `models/types`.
- `tokens.ts`: `boardRuntimeModelToken`; `module.ts`: регистрация `BoardRuntimeModel` с `boardPagePageObjectToken`; расширен `module.test.ts`.
- Убран прямой `document` из модели; хедеры/ячейки/бейджи — через `IBoardPagePageObject`. Legacy `styleColumnHeaders` хак с `#ghx-pool-wrapper` не переносился (в target-design не заложен метод PO).

**Проблемы и решения**:

- Нет.
