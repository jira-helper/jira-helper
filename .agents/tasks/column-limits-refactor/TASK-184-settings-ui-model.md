# TASK-184: SettingsUIModel + SettingsUIModel.test.ts

**Status**: IN_PROGRESS

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Реализовать valtio `SettingsUIModel` — замену `useColumnLimitsSettingsUIStore` и action-ов (`initFromProperty`, `saveToProperty`, `moveColumn`, …). Обновить `tokens.ts` (`settingsUIModelToken`) и `module.ts` (регистрация модели с зависимостью от `PropertyModel`).

## Файлы

```
src/column-limits/
├── tokens.ts              # добавить settingsUIModelToken (третий токен — контракт target-design)
├── module.ts              # зарегистрировать SettingsUIModel
└── SettingsPage/models/
    ├── SettingsUIModel.ts       # новый
    └── SettingsUIModel.test.ts  # новый (миграция settingsUIStore.test.ts, saveToProperty.test.ts, moveColumn.test.ts, initFromProperty.test.ts)
```

## InitFromPropertyData и SettingsUIModel (из target-design)

```typescript
import type { Column, UIGroup, IssueTypeState, WipLimitsProperty, ColumnLimitGroup } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';

export type InitFromPropertyData = {
  withoutGroupColumns: Column[];
  groups: UIGroup[];
  issueTypeSelectorStates?: Record<string, IssueTypeState>;
};

export class SettingsUIModel {
  // === State ===
  withoutGroupColumns: Column[] = [];
  groups: UIGroup[] = [];
  issueTypeSelectorStates: Record<string, IssueTypeState> = {};
  state: 'initial' | 'loaded' = 'initial';

  constructor(
    private propertyModel: PropertyModel,
    private logger: Logger
  ) {}

  // === Commands ===

  /** Initialize UI from property data + DOM-derived columns. */
  initFromProperty(data: InitFromPropertyData): void;

  /**
   * Build WipLimitsProperty from UI state, write to PropertyModel, persist.
   * @param existingColumnIds — column IDs present on the board (for filtering)
   */
  async save(existingColumnIds: string[]): Promise<void>;

  /** Move column between groups (or to/from "Without Group" zone). */
  moveColumn(column: Column, fromGroupId: string, toGroupId: string): void;

  /** Set limit for a group. */
  setGroupLimit(groupId: string, limit: number): void;

  /** Set color for a group. */
  setGroupColor(groupId: string, customHexColor: string): void;

  /** Set swimlane filter for a group. Empty array = clear (all swimlanes). */
  setGroupSwimlanes(groupId: string, swimlanes: Array<{ id: string; name: string }>): void;

  /** Set issue type filter state for a group. */
  setIssueTypeState(groupId: string, issueState: IssueTypeState): void;

  /** Reset to initial state. */
  reset(): void;
}
```

## Что сделать

1. Реализовать `SettingsUIModel`; чистые функции (`buildInitDataFromGroupMap` и др.) — прямой import из `SettingsPage/utils/buildInitData.ts` и `shared/`, как в target-design.
2. Добавить `settingsUIModelToken` в `tokens.ts`; убедиться, что файл соответствует [target-design.md](./target-design.md) (три токена).
3. Зарегистрировать модель в `registerColumnLimitsModule` по образцу `swimlane-wip-limits` (см. `SettingsUIModel` там — возможны доп. зависимости; для column-limits сверить с текущими `SettingsButtonContainer` / actions).
4. Перенести сценарии unit-тестов из `SettingsPage/stores/` и `SettingsPage/actions/*.test.ts`.

## Критерии приёмки

- [ ] `SettingsUIModel` соответствует контракту; сохранение идёт через `PropertyModel.persist()`.
- [ ] `tokens.ts` содержит все три токена; `module.ts` регистрирует `SettingsUIModel`.
- [ ] Unit-тесты покрывают init/save/move/валидацию на уровне модели.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от:
  - [TASK-179](./TASK-179-infrastructure.md), [TASK-180](./TASK-180-property-model.md)
  - [TASK-183](./TASK-183-board-page-migration.md) — рекомендуется завершить миграцию Board page, чтобы не смешивать два крупных потока; если команда уверена, можно начать после TASK-182 с осторожностью при конфликтах в `module.ts`.
- Референсы:
  - `src/swimlane-wip-limits/SettingsPage/models/SettingsUIModel.ts`
  - `src/swimlane-wip-limits/SettingsPage/models/SettingsUIModel.test.ts`
  - `src/features/field-limits/SettingsPage/models/SettingsUIModel.ts`
  - `src/features/field-limits/SettingsPage/models/SettingsUIModel.test.ts`
  - Legacy: `src/column-limits/SettingsPage/stores/settingsUIStore.ts`, `SettingsPage/actions/*`

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
