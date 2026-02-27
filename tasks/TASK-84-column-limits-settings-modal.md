# TASK-84: Создать modal-lifecycle.feature для Column Limits SettingsPage

**Status**: TODO

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

- [ ] `modal-lifecycle.feature` содержит 5 сценариев
- [ ] Step definitions для модалки созданы
- [ ] Тесты проходят

## Зависимости

- Зависит от: TASK-83 (helpers)
