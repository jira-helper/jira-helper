# TASK-117: add-range.feature для SettingsPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring  
**Depends on**: TASK-115

---

## Цель

Создать `add-range.feature` для сценариев добавления range и cell.

## Сценарии (7)

- SC-ADD-1: Add a new range with a cell
- SC-ADD-2: Cannot add range without name
- SC-ADD-3: Cannot add range with duplicate name
- SC-CELL-1: Button changes to "Add cell" when range name matches existing range
- SC-CELL-2: Button shows "Add range" for new name
- SC-CELL-3: Add cell to existing range
- SC-CELL-4: Cannot add duplicate cell to range

## Acceptance Criteria

- [x] Feature файл содержит 7 сценариев
- [x] cy.tsx файл использует `defineFeature`
- [x] Все сценарии проходят

---

## Результаты

**Дата**: 2025-03-02

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Созданы `add-range.feature` и `add-range.feature.cy.tsx` с 7 сценариями (SC-ADD-1..3, SC-CELL-1..4). Добавлены step definitions в `steps/common.steps.ts`: the range should contain cell, the cell should have badge icon, ranges table remain unchanged, ranges table still have only one range, range should contain cells (DataTable), range should still have only one cell, I click (Add range/Add cell). Все тесты проходят.
