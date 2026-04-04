# EPIC-3: Рефакторинг wiplimit-on-cells под best practices проекта

## Описание

Полная миграция `src/wiplimit-on-cells/` с legacy-паттернов (прямая работа с DOM, HTML-шаблоны, состояние в полях класса) на архитектуру проекта: Zustand stores, Actions, PageObject + DI, React Container/View, чистые утилиты.

**Target Design:** [target-design-wiplimit-on-cells-refactoring.md](./target-design-wiplimit-on-cells-refactoring.md)

**Референсы:**
- `src/person-limits/` — полный пример миграции
- `src/column-limits/` — SettingsPage на React

## Задачи

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 19 | [TASK-19](./TASK-19-write-feature-files.md) | Написать .feature файлы (Gherkin) | DONE |
| 20 | [TASK-20](./TASK-20-extract-shared-types.md) | Извлечь общие типы в `types.ts` | DONE |
| 21 | [TASK-21](./TASK-21-extract-pure-utils.md) | Извлечь чистые утилиты (matrix, borders, badge) + тесты | DONE |
| 22 | [TASK-22](./TASK-22-create-property-store.md) | Создать Property Store (Zustand) | DONE |
| 23 | [TASK-23](./TASK-23-create-board-pageobject.md) | Создать Board PageObject + DI | DONE |
| 24 | [TASK-24](./TASK-24-create-runtime-store.md) | Создать Runtime Store | DONE |
| 25 | [TASK-25](./TASK-25-refactor-board-index.md) | Рефакторинг BoardPage index.ts | DONE |
| 26 | [TASK-26](./TASK-26-create-settings-ui-store.md) | Создать Settings UI Store | DONE |
| 27 | [TASK-27](./TASK-27-create-range-table-react.md) | Создать RangeTable React-компоненты (замена table.ts) | DONE |
| 28 | [TASK-28](./TASK-28-create-range-form.md) | Создать RangeForm React-компонент | DONE |
| 29 | [TASK-29](./TASK-29-create-settings-modal.md) | Создать SettingsModal Container + View | DONE |
| 30 | [TASK-30](./TASK-30-create-settings-button.md) | Создать SettingsButton Container + View | DONE |
| 31 | [TASK-31](./TASK-31-refactor-settings-index.md) | Рефакторинг SettingsPage index.ts (createRoot) | DONE |
| 32 | [TASK-32](./TASK-32-delete-legacy-files.md) | Удалить legacy-файлы (table.ts, HTML-шаблоны) | DONE |
| 33 | [TASK-33](./TASK-33-update-stories.md) | Обновить Storybook stories | DONE |
| 34 | [TASK-34](./TASK-34-verification.md) | Верификация: тесты + линтер | DONE |
| 35 | [TASK-35](./TASK-35-store-bdd-tests.md) | BDD тесты для stores (vitest-cucumber) | DONE |
| 36 | [TASK-36](./TASK-36-cypress-bdd-tests.md) | Cypress BDD тесты для компонентов | DONE |

## Граф зависимостей

```
Phase 0: Documentation
TASK-19 (feature files) ─────── DONE

Phase 1: Foundation
TASK-20 (types) ─────────────┐
TASK-21 (utils) ────────────┐├──> Phase 2
TASK-22 (property store) ───┘│
                             │
Phase 2: Board Page          │
TASK-23 (pageObject) ───────┐│
TASK-24 (runtime store) ────┤├──> TASK-25 (board index.ts)
                            ││
Phase 3: Settings React     ││
TASK-26 (settings UI store)─┤│
TASK-27 (RangeTable) ──────┐││
TASK-28 (RangeForm) ───────┤├┤──> TASK-29 (Modal) ──> TASK-30 (Button) ──> TASK-31 (settings index.ts)
                           │││
Phase 4: Cleanup           │││
TASK-25 + TASK-31 ──────────┴┴┘──> TASK-32 (delete legacy) ──> TASK-33 (stories) ──> TASK-34 (verify)
```

**Параллельное выполнение:**
- Phase 1: TASK-20, TASK-21, TASK-22 — параллельно
- Phase 2: TASK-23, TASK-24 — параллельно (после Phase 1)
- Phase 3: TASK-26, TASK-27, TASK-28 — параллельно (после Phase 1)
- Sequential: TASK-25 (после 20-24), TASK-29→30→31 (после 26-28), TASK-32→33→34 (после всех)
