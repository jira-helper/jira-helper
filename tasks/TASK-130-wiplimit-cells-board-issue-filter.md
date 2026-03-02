# TASK-130: issue-type-filter.feature для BoardPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring  
**Depends on**: TASK-124

---

## Цель

Создать `issue-type-filter.feature` для сценариев фильтрации по типу issue.

## Сценарии (2)

- SC-FILTER-1: Count only specified issue types
- SC-FILTER-2: Count all issues when no type filter is set

## Acceptance Criteria

- [ ] Feature файл содержит 2 сценария с DataTable для issues
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
