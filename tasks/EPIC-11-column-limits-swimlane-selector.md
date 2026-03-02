# EPIC-11: Column Limits Swimlane Selector

**Status**: TODO  
**Depends on**: EPIC-10 (finish BDD refactoring first)  
**Target Design**: [target-design-column-limits-swimlane-selector.md](./target-design-column-limits-swimlane-selector.md)

---

## Цель

Добавить явный выбор свимлейнов для каждой группы колонок в Column Limits (аналогично Person Limits).

## Проблема

Сейчас Column Limits использует глобальный `ignoredSwimlanes` из Swimlane Settings.
Это неочевидно и неудобно — настройка скрыта в другом месте.

## Решение

1. Создать **shared** `SwimlaneSelector` компонент
2. Использовать его в `PersonalWipLimitContainer` (рефакторинг)
3. Добавить в `ColumnLimitsForm` для per-group конфигурации
4. Убрать глобальный `ignoredSwimlanes`

## Файловая структура (Target)

```
src/shared/components/SwimlaneSelector/
├── index.ts
├── SwimlaneSelector.tsx
└── SwimlaneSelector.stories.tsx

src/column-limits/
├── types.ts                    # + swimlanes в ColumnLimitGroup, UIGroup
├── SettingsPage/
│   └── ColumnLimitsForm.tsx    # + SwimlaneSelector
└── BoardPage/
    └── actions/
        └── calculateGroupStats.ts  # use group.swimlanes

src/person-limits/SettingsPage/
└── components/
    └── PersonalWipLimitContainer.tsx  # use shared SwimlaneSelector
```

---

## Phase 1: BDD Сценарии (Gherkin)

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 1 | [TASK-102](./TASK-102-swimlane-selector-settings-feature.md) | Feature файл для SwimlaneSelector UI (5 сценариев) | DONE |
| 2 | [TASK-103](./TASK-103-swimlane-filter-board-feature.md) | Feature файл для BoardPage swimlane filtering (3 сценария) | DONE |

---

## Phase 2: Shared Component

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 3 | [TASK-104](./TASK-104-shared-swimlane-selector.md) | Создать shared `SwimlaneSelector` компонент + Storybook | DONE |
| 4 | [TASK-105](./TASK-105-refactor-personal-wip-limit-container.md) | Рефакторинг `PersonalWipLimitContainer` — использовать shared компонент | DONE |

---

## Phase 3: Column Limits Integration

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 5 | [TASK-106](./TASK-106-column-limits-types-swimlanes.md) | Обновить `types.ts` — добавить `swimlanes` в типы | DONE |
| 6 | [TASK-107](./TASK-107-column-limits-property-swimlanes.md) | Обновить property store (`initFromProperty`, `saveToProperty`) | DONE |
| 7 | [TASK-108](./TASK-108-settings-ui-store-swimlanes.md) | Обновить `settingsUIStore` — добавить `setGroupSwimlanes` action | DONE |
| 8 | [TASK-109](./TASK-109-column-limits-form-swimlane-selector.md) | Интегрировать `SwimlaneSelector` в `ColumnLimitsForm` | DONE |

---

## Phase 4: BoardPage Logic

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 9 | [TASK-110](./TASK-110-calculate-group-stats-swimlanes.md) | Обновить `calculateGroupStats.ts` — использовать `group.swimlanes` | DONE |
| 10 | [TASK-111](./TASK-111-cleanup-global-ignored-swimlanes.md) | Удалить глобальный `ignoredSwimlanes` из runtimeStore и index.ts | TODO |

---

## Phase 5: BDD Tests Implementation

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 11 | [TASK-112](./TASK-112-swimlane-selector-cypress-tests.md) | Реализовать `swimlane-selector.feature.cy.tsx` (SettingsPage) | DONE |
| 12 | [TASK-113](./TASK-113-swimlane-filter-cypress-tests.md) | Реализовать `swimlane-filter.feature.cy.tsx` (BoardPage) | DONE |

---

## Phase 6: Verification

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 13 | [TASK-114](./TASK-114-swimlane-selector-verification.md) | Верификация: build, lint, tests, manual testing | TODO |

---

## Граф зависимостей

```
Phase 1 (Feature files - сначала!)
┌─────────────────────────────────────────────────────────────────┐
│ TASK-102 (feature: settings UI)                                 │
│ TASK-103 (feature: board logic)                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                v
Phase 2-4 (Implementation)
┌─────────────────────────────────────────────────────────────────┐
│ TASK-104 (shared SwimlaneSelector)                              │
│    ├──> TASK-105 (refactor PersonalWipLimit)                    │
│    └──> TASK-106 (types) ──> TASK-107 (property)                │
│                          └──> TASK-108 (store)                  │
│                               └──> TASK-109 (ColumnLimitsForm)  │
│                                                                 │
│ TASK-110 (calculateGroupStats) ──> TASK-111 (cleanup)           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                v
Phase 5 (BDD Tests)
┌─────────────────────────────────────────────────────────────────┐
│ TASK-112 (settings tests)                                       │
│ TASK-113 (board tests)                                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                v
Phase 6 (Verification)
┌─────────────────────────────────────────────────────────────────┐
│ TASK-114 (verify)                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Ожидаемый результат

- **Shared component**: `SwimlaneSelector` в `src/shared/components/`
- **Person Limits**: использует shared component (рефакторинг)
- **Column Limits UI**: каждая группа имеет свой swimlane selector
- **Column Limits Logic**: `calculateGroupStats` использует per-group swimlanes
- **Cleanup**: глобальный `ignoredSwimlanes` удален
- **Tests**: 8 BDD сценариев (5 UI + 3 board logic)

## Референсы

- [Target Design](./target-design-column-limits-swimlane-selector.md)
- `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` — текущая реализация swimlane selector
