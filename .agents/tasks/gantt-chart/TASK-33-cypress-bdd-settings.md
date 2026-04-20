# TASK-33: Cypress BDD — settings scenarios

**Status**: TODO
**Type**: bdd-tests

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Автоматизация [gantt-chart-settings.feature](./gantt-chart-settings.feature): первый запуск, mapping, exclusion, каскад scope, Copy from, типы связей.

## Файлы

```
src/features/gantt-chart/**/*.cy.tsx
# + при необходимости GanttSettingsContainer.cy.tsx рядом с контейнером
```

## Что сделать

1. Следовать [cypress-bdd-testing skill](../../../.cursor/skills/cypress-bdd-testing/SKILL.md).
2. Покрыть @SC-GANTT-SET-*; мок `localStorage` и API.

## Критерии приёмки

- [ ] Сценарии настроек из feature-файла реализованы.
- [ ] Cypress/тестовая команда проекта проходит.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-29](./TASK-29-gantt-settings-container.md), [TASK-30](./TASK-30-link-type-inclusion-ui.md)

---

## Результаты

_(заполняется по завершении)_
