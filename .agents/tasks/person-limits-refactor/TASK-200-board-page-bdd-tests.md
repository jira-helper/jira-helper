# TASK-200: Адаптация BoardPage BDD (Cypress component)

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Адаптировать Cypress BDD для Board tab person-limits: `BoardPage/features/helpers.tsx`, step definitions (`*.feature.cy.tsx`, `steps/common.steps.ts`) — заменить setup с zustand/DI на резолв `BoardRuntimeModel` / `PropertyModel` из тестового контейнера, обновить моки PageObject. Содержимое `.feature` файлов **не менять** (требование requirements.md); меняются только привязки шагов и harness.

## Файлы

```
src/person-limits/BoardPage/features/
├── helpers.tsx              # изменение
├── *.feature                # без изменений сценариев
├── *.feature.cy.tsx         # изменение
└── steps/common.steps.ts    # изменение
```

## Что сделать

1. Обновить тестовый DI/setup так, чтобы сценарии display/interaction продолжали проходить.
2. Заполнить таблицу покрытия Scenario → Cypress test (в комментарии к PR или в задаче при завершении).
3. Прогнать component-тесты по glob проекта для person-limits Board features.

## Критерии приёмки

- [ ] Все соответствующие `.feature.cy.tsx` для BoardPage проходят локально.
- [ ] Gherkin-файлы не изменены по смыслу сценариев.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-198](./TASK-198-board-page-index-migration.md), [TASK-199](./TASK-199-avatars-container-use-model.md)
- Референс сценариев: [board-runtime.feature](./board-runtime.feature) (высокоуровневые ожидания)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
