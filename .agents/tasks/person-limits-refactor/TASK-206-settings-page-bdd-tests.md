# TASK-206: Адаптация SettingsPage BDD (Cypress component)

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Адаптировать Cypress BDD для Settings person-limits: `SettingsPage/features/helpers.tsx`, `*.feature.cy.tsx`, `steps/common.steps.ts` — тестовый DI и шаги для `SettingsUIModel` / `PropertyModel`. Файлы `.feature` не менять по смыслу; обновляются привязки и harness.

## Файлы

```
src/person-limits/SettingsPage/features/
├── helpers.tsx
├── *.feature
├── *.feature.cy.tsx
└── steps/common.steps.ts

src/person-limits/SettingsPage/components/**/*.cy.tsx   # по необходимости
```

## Что сделать

1. Обновить setup контейнера в helpers для резолва `settingsUIModelToken` и моков `BoardPropertyService`.
2. Прогнать все сценарии Settings; исправить flaky шаги.
3. Зафиксировать таблицу покрытия Scenario → test при закрытии задачи.

## Критерии приёмки

- [ ] Cypress component тесты Settings person-limits проходят.
- [ ] Gherkin сценарии не переписывались семантически.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-205](./TASK-205-settings-page-index-load-property.md)
- Референс: [settings-ui.feature](./settings-ui.feature)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
