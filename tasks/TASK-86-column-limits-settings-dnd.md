# TASK-86: Создать drag-drop.feature для Column Limits SettingsPage

**Status**: DONE

---

## Acceptance: Исправить step definitions

### Проблемы

**Проблема 1**: `I drag "([^"]*)" column to the same group` — плохой шаг, неявный.
**Решение**: Использовать существующий `I drag "([^"]*)" column to group "([^"]*)"`. Обновить SC-ADD-2 в `add-group.feature`.

**Проблема 2**: `And group "group-1" should be empty or deleted` — неопределённый шаг.
**Решение**: Заменить на явные альтернативы:
- `Then I should not see group "group-1"` — если группа удалена
- `Then I should see only 1 group` — если нужно проверить количество групп
Обновить SC-DND-2 в `drag-drop.feature`.

**Проблема 3**: В `drag-drop.feature` для SC-DND-1 нужно создавать группу явно, чтобы drag в неё работал.
**Решение**: SC-DND-2 использует две группы — при drag колонки из group-1 в group-2, group-1 становится пустой и должна быть удалена. Проверять `Then I should not see group "group-1"`.

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
