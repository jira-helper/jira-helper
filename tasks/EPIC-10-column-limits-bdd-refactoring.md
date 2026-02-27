# EPIC-10: Column Limits BDD Test Refactoring

**Status**: TODO

---

## Цель

Перевести column-limits тесты на новый BDD runner формат (как person-limits).

## Текущее состояние

### BoardPage
- `board-page.feature`: 12 сценариев (display: 3, exceed: 3, filters: 3, multi: 3)
- `board-page.feature.cy.tsx`: ~600 строк, старый `Scenario/Step` формат

### SettingsPage
- `SettingsPage.feature`: 30 сценариев
- `SettingsPage.feature.cy.tsx`: ~1187 строк, старый `Scenario/Step` формат

## Проблемы

1. **Старый формат** — `Scenario/Step` функции вместо BDD runner с `defineFeature`
2. **Монолитные файлы** — всё в одном файле
3. **Нет DataTable** — группы настраиваются через store.setData() в каждом тесте
4. **Нет переиспользования** — нет `helpers.tsx` и `common.steps.ts`
5. **Дублирование** — setup код копируется в каждый тест

## Целевая структура

```
src/column-limits/BoardPage/features/
├── display.feature              # SC-DISPLAY-1..3
├── exceed.feature               # SC-EXCEED-1..3
├── filters.feature              # SC-SWIM-1, SC-ISSUE-1..2
├── multi-groups.feature         # SC-MULTI-1..3
├── display.feature.cy.tsx
├── exceed.feature.cy.tsx
├── filters.feature.cy.tsx
├── multi-groups.feature.cy.tsx
├── helpers.tsx
└── steps/
    └── common.steps.ts

src/column-limits/SettingsPage/features/
├── modal-lifecycle.feature      # SC-MODAL-1..5
├── add-group.feature            # SC-ADD-1..5
├── drag-drop.feature            # SC-DND-1..5
├── edit-group.feature           # SC-EDIT-1..5
├── delete-group.feature         # SC-DELETE-1..2
├── validation.feature           # SC-VALID-1..3
├── edge-cases.feature           # SC-EDGE-1..3
├── *.feature.cy.tsx
├── helpers.tsx
└── steps/
    └── common.steps.ts
```

## Формат DataTable для групп

```gherkin
Given there are column groups:
  | name        | columns             | limit | color   | issueTypes |
  | Development | In Progress, Review | 5     | #36B37E |            |
  | QA          | Done                | 3     |         | Bug        |
```

## Формат DataTable для issues

```gherkin
Given the board has issues:
  | column      | swimlane | issueType |
  | In Progress | Frontend | Task      |
  | In Progress | Frontend | Bug       |
  | Review      | Backend  | Task      |
```

## Задачи

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 1 | [TASK-77](./TASK-77-column-limits-boardpage-helpers.md) | Создать helpers.tsx для BoardPage | DONE |
| 2 | [TASK-78](./TASK-78-column-limits-boardpage-display.md) | Создать display.feature и steps | DONE |
| 3 | [TASK-79](./TASK-79-column-limits-boardpage-exceed.md) | Создать exceed.feature и steps | TODO |
| 4 | [TASK-80](./TASK-80-column-limits-boardpage-filters.md) | Создать filters.feature (swimlane + issueType) | TODO |
| 5 | [TASK-81](./TASK-81-column-limits-boardpage-multi.md) | Создать multi-groups.feature | TODO |
| 6 | [TASK-82](./TASK-82-column-limits-boardpage-cleanup.md) | Удалить старые файлы BoardPage | TODO |
| 7 | [TASK-83](./TASK-83-column-limits-settings-helpers.md) | Создать helpers.tsx для SettingsPage | TODO |
| 8 | [TASK-84](./TASK-84-column-limits-settings-modal.md) | Создать modal-lifecycle.feature | TODO |
| 9 | [TASK-85](./TASK-85-column-limits-settings-add.md) | Создать add-group.feature | TODO |
| 10 | [TASK-86](./TASK-86-column-limits-settings-dnd.md) | Создать drag-drop.feature | TODO |
| 11 | [TASK-87](./TASK-87-column-limits-settings-edit.md) | Создать edit-group.feature | TODO |
| 12 | [TASK-88](./TASK-88-column-limits-settings-delete.md) | Создать delete-group.feature | TODO |
| 13 | [TASK-89](./TASK-89-column-limits-settings-validation.md) | Создать validation.feature | TODO |
| 14 | [TASK-90](./TASK-90-column-limits-settings-edge.md) | Создать edge-cases.feature | TODO |
| 15 | [TASK-91](./TASK-91-column-limits-settings-cleanup.md) | Удалить старые файлы SettingsPage | TODO |

## Ожидаемый результат

- **BoardPage**: 12 тестов в 4 feature файлах
- **SettingsPage**: 30 тестов в 7 feature файлах
- **Всего**: 42 теста
- Все тесты используют новый BDD runner
- DataTable для групп и issues
- Общие step definitions в `common.steps.ts`

## Референсы

- `src/person-limits/BoardPage/features/` — готовый пример
- `src/person-limits/SettingsPage/features/` — готовый пример
- `cypress/support/bdd-runner.ts` — BDD runner
