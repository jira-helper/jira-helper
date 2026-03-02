# TASK-132: edge-cases.feature для BoardPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `edge-cases.feature` для граничных сценариев.

## Сценарии (2)

- SC-EDGE-1: Skip cells not found on current board
- SC-EDGE-2: Board shows normally when no WIP limit settings exist

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
