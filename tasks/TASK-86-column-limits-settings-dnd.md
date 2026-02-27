# TASK-86: Создать drag-drop.feature для Column Limits SettingsPage

**Status**: TODO

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать drag-drop.feature с 5 сценариями drag-and-drop взаимодействий.

## Сценарии (5)

| ID | Название |
|----|----------|
| SC-DND-1 | Move column from "Without Group" to existing group |
| SC-DND-2 | Move column from one group to another |
| SC-DND-3 | Move column back to "Without Group" |
| SC-DND-4 | Dropzone highlights on drag over |
| SC-DND-5 | Dragged column shows drag preview |

## Критерии приёмки

- [ ] `drag-drop.feature` содержит 5 сценариев
- [ ] cy.drag() работает
- [ ] Тесты проходят

## Зависимости

- Зависит от: TASK-83, TASK-84
