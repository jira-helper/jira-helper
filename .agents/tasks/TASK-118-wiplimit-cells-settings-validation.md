# TASK-118: validation.feature для SettingsPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 1 - SettingsPage Refactoring  
**Depends on**: TASK-115

---

## Цель

Создать `validation.feature` для сценариев валидации.

## Сценарии (2)

- SC-VALID-1: Cannot add range or cell without selecting swimlane
- SC-VALID-2: Cannot add range or cell without selecting column

## Acceptance Criteria

- [x] Feature файл содержит 2 сценария
- [x] cy.tsx файл использует `defineFeature`
- [x] Все сценарии проходят

---

## Результаты

**Дата**: 2025-03-02

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Созданы файлы:
- `src/wiplimit-on-cells/SettingsPage/features/validation.feature` — 2 сценария
- `src/wiplimit-on-cells/SettingsPage/features/validation.feature.cy.tsx` — `defineFeature`

Добавлены в `steps/common.steps.ts`:
- `Then I should see an alert "..."` — проверка alert
- Обновлён `When I click "..."` — для "Add range"/"Add cell" stub alert и клик по #WIP_buttonRange

Все тесты проходят.
