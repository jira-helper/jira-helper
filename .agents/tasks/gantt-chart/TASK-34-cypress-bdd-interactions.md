# TASK-34: Cypress BDD — interactions scenarios

**Status**: VERIFICATION
**Type**: bdd-tests

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Автоматизация [gantt-chart-interactions.feature](./gantt-chart-interactions.feature): zoom, pan, scrollbars, интервалы оси, hover tooltip.

## Файлы

```
src/features/gantt-chart/**/*.cy.tsx
```

## Что сделать

1. [cypress-bdd-testing skill](../../../.cursor/skills/cypress-bdd-testing/SKILL.md).
2. Для drag/zoom использовать стабильные селекторы и при необходимости `cy.trigger` / `pointer` API Cypress.

## Критерии приёмки

- [ ] @SC-GANTT-INT-* покрыты.
- [ ] Команда Cypress проекта зелёная.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-21](./TASK-21-gantt-chart-view-d3-zoom.md), [TASK-22](./TASK-22-gantt-toolbar.md), [TASK-23](./TASK-23-gantt-tooltip.md)

---

## Результаты

_(заполняется по завершении)_
