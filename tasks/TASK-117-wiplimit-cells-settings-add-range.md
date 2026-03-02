# TASK-117: add-range.feature для SettingsPage

**Status**: TODO  
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

- [ ] Feature файл содержит 7 сценариев
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
