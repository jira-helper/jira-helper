# TASK-84: Создать modal-lifecycle.feature для Column Limits SettingsPage

**Status**: DONE

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Создать modal-lifecycle.feature с 5 сценариями жизненного цикла модального окна.

## Сценарии (5)

| ID | Название |
|----|----------|
| SC-MODAL-1 | Open modal with empty state |
| SC-MODAL-2 | Open modal with pre-configured groups |
| SC-MODAL-3 | Cancel button closes modal without saving |
| SC-MODAL-4 | Save button persists changes |
| SC-MODAL-5 | Open modal with pre-configured groups and no columns in "Without Group" |

## Формат DataTable для групп

```gherkin
Given there are configured column groups:
  | name    | columns             | limit |
  | group-1 | In Progress, Review | 5     |
  | group-2 | To Do               | 3     |
```

## Критерии приёмки

- [x] `modal-lifecycle.feature` содержит 5 сценариев
- [x] Step definitions для модалки созданы
- [x] Тесты проходят

## Acceptance (исправление)

**Проблема:** SC-MODAL-3 кликает Cancel без изменений. Нужно проверить что Cancel **после изменений** не сохраняет изменения.

**Решение:** Обновить SC-MODAL-3 чтобы сначала сделать изменения (drag column, set limit), потом Cancel, и проверить что `@updateBoardProperty` не вызван.

```gherkin
@SC-MODAL-3
Scenario: Cancel button closes modal without saving
  Given no column groups are configured
  When I open the settings modal
  And I drag "In Progress" column to create a new group
  And I set limit to 5
  And I click "Cancel"
  Then the modal should be closed
  And no changes should be saved
```

## Зависимости

- Зависит от: TASK-83 (helpers)
