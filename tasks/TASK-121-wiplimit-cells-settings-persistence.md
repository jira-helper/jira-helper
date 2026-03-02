# TASK-121: persistence.feature для SettingsPage

**Status**: TODO  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring  
**Depends on**: TASK-115

---

## Цель

Создать `persistence.feature` для сценариев сохранения и backward compatibility.

## Сценарии (3)

- SC-PERSIST-1: Save persists to Jira board property
- SC-PERSIST-2: Settings load on page open
- SC-COMPAT-1: Load settings with legacy "swimline" field

## Acceptance Criteria

- [ ] Feature файл содержит 3 сценария
- [ ] cy.tsx файл использует `defineFeature`
- [ ] Все сценарии проходят
