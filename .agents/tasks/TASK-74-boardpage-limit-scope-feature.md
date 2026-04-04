# TASK-74: Добавить сценарий комбинированных фильтров

**Status**: DONE

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Добавить сценарий с комбинированными фильтрами (columns + swimlanes + issueTypes) в существующий `display.feature`.

**Примечание**: Сценарии SC-SCOPE-1 (columns), SC-SCOPE-2 (swimlanes), SC-SCOPE-3 (issueTypes) уже покрыты в display.feature как SC-DISPLAY-7, SC-DISPLAY-9, SC-DISPLAY-10.

## Файлы

```
src/person-limits/BoardPage/features/
├── display.feature              # обновить - добавить 1 сценарий
└── steps/
    └── common.steps.ts          # обновить если нужно
```

## Сценарий

| ID | Название |
|----|----------|
| SC-DISPLAY-12 | Limit with combined filters (columns + swimlanes + issueTypes) |

## Что сделать

### 1. Добавить в `display.feature`

```gherkin
@SC-DISPLAY-12
Scenario: Limit with combined filters (columns + swimlanes + issueTypes)
  Given there are WIP limits:
    | person   | personDisplayName | limit | columns | swimlanes | issueTypes |
    | john.doe | John Doe          | 2     | col1    | sw1       | Bug        |
  Given the board has issues:
    | person   | personDisplayName | column | swimlane | issueType |
    | john.doe | John Doe          | col1   | sw1      | Bug       |
    | john.doe | John Doe          | col1   | sw1      | Bug       |
    | john.doe | John Doe          | col1   | sw1      | Task      |
    | john.doe | John Doe          | col1   | sw2      | Bug       |
    | john.doe | John Doe          | col2   | sw1      | Bug       |
  When the board is displayed
  Then the counter for "john.doe" should show "2 / 2"
  And the counter for "john.doe" should be yellow
```

Этот сценарий проверяет:
- 2 issues в col1 + sw1 + Bug → учитываются (2)
- 1 issue в col1 + sw1 + Task → НЕ учитывается (issueType не Bug)
- 1 issue в col1 + sw2 + Bug → НЕ учитывается (swimlane не sw1)
- 1 issue в col2 + sw1 + Bug → НЕ учитывается (column не col1)

### 2. Обновить step definitions (если нужно)

Проверить что существующие степы поддерживают комбинированные фильтры.

## Критерии приёмки

- [ ] SC-DISPLAY-12 добавлен в display.feature
- [ ] Тест проходит: `npx cypress run --component --spec "src/person-limits/BoardPage/features/display.feature.cy.tsx"`
- [ ] Все 12 тестов проходят

## Зависимости

- Зависит от: TASK-73 (display.feature и step definitions)

---

## Результаты

**Дата**: 2025-02-27

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Добавлен сценарий SC-DISPLAY-12 в `display.feature`. Step definitions в `common.steps.ts` уже поддерживали комбинированные фильтры (columns + swimlanes + issueTypes) — изменений не потребовалось. Все 12 тестов проходят.
