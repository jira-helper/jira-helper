# TASK-35: BDD тесты для stores на основе .feature файлов

## Описание

Написать vitest-cucumber BDD тесты для stores `wiplimit-on-cells` на основе .feature файлов.

## Контекст

Есть 2 feature файла:
- `src/wiplimit-on-cells/SettingsPage/settings.feature` — 25 сценариев
- `src/wiplimit-on-cells/BoardPage/board.feature` — 20 сценариев

Нужно покрыть логику stores BDD тестами по паттерну проекта.

## Референсы

- `src/person-limits/SettingsPage/stores/settingsUIStore.bdd.test.ts` — пример BDD тестов store
- `.cursor/skills/vitest-bdd-testing/SKILL.md` — инструкция по написанию BDD тестов

## Файлы для создания

```
src/wiplimit-on-cells/SettingsPage/stores/
└── settingsUIStore.bdd.test.ts    # BDD тесты для Settings UI Store

src/wiplimit-on-cells/property/
└── store.bdd.test.ts              # BDD тесты для Property Store
```

## Scope Settings UI Store

Из `settings.feature` покрыть сценарии, относящиеся к store-логике:
- SC4: Add a new range with a cell
- SC5: Cannot add range without name
- SC6: Cannot add range with duplicate name
- SC7: Button changes to "Add cell" when range name matches
- SC9: Add cell to existing range
- SC10: Cannot add duplicate cell to range
- SC13: Edit range name inline
- SC14: Edit WIP limit inline
- SC15: Toggle disable checkbox
- SC17: Delete a range
- SC18: Delete a cell from range
- SC19: Clear all settings

## Scope Property Store

Из `settings.feature` покрыть:
- SC20: Save persists to Jira board property
- SC21: Settings load on page open
- SC22: Load settings with legacy "swimline" field (backward compatibility)

## Требования

1. Использовать `vitest-cucumber` для маппинга Gherkin шагов
2. AAA-паттерн (Arrange-Act-Assert)
3. Изоляция тестов через `getInitialState()`
4. Покрыть happy path и edge cases

## Acceptance Criteria

- [ ] `settingsUIStore.bdd.test.ts` покрывает сценарии Settings UI Store
- [ ] `store.bdd.test.ts` покрывает сценарии Property Store с backward compatibility
- [ ] Все тесты проходят: `npm test -- --run src/wiplimit-on-cells/`
- [ ] ESLint без ошибок

## Зависимости

- TASK-26 (Settings UI Store) — DONE
- TASK-22 (Property Store) — DONE
