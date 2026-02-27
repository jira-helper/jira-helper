# EPIC-9: Person Limits BoardPage BDD Refactoring

**Status**: TODO

---

## Описание

Рефакторинг BDD тестов модуля `person-limits/BoardPage` для соответствия новой архитектуре тестирования, используемой в `person-limits/SettingsPage`:

1. **Разбиение feature файла** — разделить монолитный `board-page.feature` на функциональные области
2. **BDD Runner** — использовать новый подход с парсингом Gherkin и переиспользуемыми step definitions
3. **Универсальные степы** — создать общие step definitions для BoardPage

## Цели

- Единообразная архитектура тестирования между SettingsPage и BoardPage
- Переиспользуемые step definitions
- Минимальный код в .cy.tsx файлах (~16 строк)
- Читаемые feature файлы с описанием

## Текущее состояние

| Метрика | Значение |
|---------|----------|
| Feature файл | `board-page.feature` — 186 строк, 16 сценариев |
| Test файл | `board-page.feature.cy.tsx` — 848 строк |
| Подход | Старый (inline `Scenario/Step`, не переиспользуемые) |
| Группы | DISPLAY (7), LIMIT SCOPE (4), INTERACTION (3) |

## Целевая структура

```
src/person-limits/BoardPage/features/
├── display.feature              # SC-DISPLAY-1 — SC-DISPLAY-7
├── limit-scope.feature          # SC-SCOPE-1 — SC-SCOPE-4
├── interaction.feature          # SC-INTERACT-1 — SC-INTERACT-3
├── display.feature.cy.tsx       # ~16 строк
├── limit-scope.feature.cy.tsx   # ~16 строк
├── interaction.feature.cy.tsx   # ~16 строк
├── steps/
│   └── common.steps.ts          # Общие step definitions
└── helpers.tsx                  # Fixtures, createMockIssue, createStats, setup
```

---

## Задачи

| # | Task | Описание | Status |
|---|------|----------|--------|
| 1 | [TASK-72](./TASK-72-boardpage-create-helpers.md) | Создать helpers.tsx с fixtures и setup | DONE |
| 2 | [TASK-73](./TASK-73-boardpage-display-feature.md) | Создать display.feature и step definitions | DONE |
| 3 | [TASK-74](./TASK-74-boardpage-limit-scope-feature.md) | Добавить сценарий комбинированных фильтров | DONE |
| 4 | [TASK-75](./TASK-75-boardpage-interaction-feature.md) | Создать interaction.feature и step definitions | DONE |
| 5 | [TASK-76](./TASK-76-boardpage-cleanup.md) | Удалить старые файлы, верификация | DONE |

---

## Референс

Архитектура `person-limits/SettingsPage/features/`:

```
src/person-limits/SettingsPage/features/
├── add-limit.feature              # 11 сценариев
├── edit-limit.feature             # 13 сценариев
├── delete-limit.feature           # 4 сценария
├── modal-lifecycle.feature        # 2 сценария
├── person-search.feature          # 6 сценариев
├── *.feature.cy.tsx               # ~16 строк каждый
├── steps/
│   └── common.steps.ts            # 285 строк, 40+ степов
└── helpers.tsx                    # 196 строк
```

---

## Критерии завершения EPIC

- [ ] Создана папка `features/` с helpers и step definitions
- [ ] Feature файлы разбиты на 3 функциональных области
- [ ] Все 16 сценариев покрыты тестами
- [ ] Test файлы используют BDD runner (~16 строк каждый)
- [ ] Удалены старые `board-page.feature` и `board-page.feature.cy.tsx`
- [ ] `npx cypress run --component --spec "src/person-limits/BoardPage/features/*.feature.cy.tsx"` проходит
