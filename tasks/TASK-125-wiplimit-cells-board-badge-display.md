# TASK-125: badge-display.feature для BoardPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `badge-display.feature` для сценариев отображения badge.

## Сценарии (2)

- SC-BADGE-1: Show badge with issue count and limit on cell with showBadge enabled
- SC-BADGE-2: Badge counts issues across all cells in range

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария с DataTable для cells
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
