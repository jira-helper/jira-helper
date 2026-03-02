# TASK-128: dashed-borders.feature для BoardPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `dashed-borders.feature` для сценариев пунктирных границ.

## Сценарии (4)

- SC-BORDER-1: Single cell gets all four borders
- SC-BORDER-2: Adjacent cells in same row share inner borders
- SC-BORDER-3: Adjacent cells in same column share inner borders
- SC-BORDER-4: L-shaped range has correct borders

## Acceptance Criteria

- [ ] Feature файл содержит 4 сценария с DataTable для cells
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
