# EPIC-4: Покрытие Cypress BDD тестами всех feature файлов

## Описание

Довести покрытие Cypress BDD тестами до 100% по всем `.feature` файлам проекта.

**Валидация:** `node scripts/validate-feature-tests.mjs`

## Текущее состояние

| Feature | Статус | Проблема |
|---------|--------|----------|
| person-limits/SettingsPage | ✅ OK | 17/17 сценариев покрыты |
| person-limits/BoardPage | ❌ FAIL | Файл тестов отсутствует |
| column-limits/SettingsPage | ❌ FAIL | 6 сценариев отсутствуют |
| wiplimit-on-cells/SettingsPage | ❌ FAIL | 15 сценариев отсутствуют |
| wiplimit-on-cells/BoardPage | ❌ FAIL | Файл тестов отсутствует |

## Задачи

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 37 | [TASK-37](./TASK-37-column-limits-cypress-tests.md) | column-limits SettingsPage: 6 сценариев | DONE |
| 38 | [TASK-38](./TASK-38-person-limits-board-cypress-tests.md) | person-limits BoardPage: создать файл | DONE |
| 39 | [TASK-39](./TASK-39-wiplimit-board-cypress-tests.md) | wiplimit-on-cells BoardPage: создать файл | DONE |
| 40 | [TASK-40](./TASK-40-wiplimit-settings-missing-scenarios.md) | wiplimit-on-cells SettingsPage: 15 сценариев | DONE |
| 45 | [TASK-45](./TASK-45-person-limits-modal-lifecycle-tests.md) | person-limits SettingsPage: SC16, SC17 (modal lifecycle) | DONE |
| 46 | [TASK-46](./TASK-46-refactor-feature-scenarios-grouping.md) | Рефакторинг группировки сценариев (user job) | DONE |
| 47 | [TASK-47](./TASK-47-fix-failing-edit-scenarios.md) | Исправить 5 падающих EDIT сценариев | DONE |
| 48 | [TASK-48](./TASK-48-boardpage-tests-refactoring.md) | Рефакторинг тестов BoardPage + DI fix | TODO |

## Граф зависимостей

```
Все задачи независимы — можно выполнять параллельно

TASK-37 (column-limits Settings) ─────┐
TASK-38 (person-limits Board) ────────┤
TASK-39 (wiplimit Board) ─────────────┼──> Финальная валидация
TASK-40 (wiplimit Settings) ──────────┤
TASK-45 (person-limits Modal) ────────┘
```

## Acceptance Criteria

- [ ] `node scripts/validate-feature-tests.mjs` проходит без ошибок (exit code 0)
- [ ] Все Cypress тесты проходят
