# TASK-35: Cypress BDD — error scenarios

**Status**: TODO
**Type**: bdd-tests

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Автоматизация [gantt-chart-errors.feature](./gantt-chart-errors.feature): ошибка загрузки, retry, loading state, повторная ошибка.

## Файлы

```
src/features/gantt-chart/**/*.cy.tsx
```

## Что сделать

1. [cypress-bdd-testing skill](../../../.cursor/skills/cypress-bdd-testing/SKILL.md).
2. Моки ответов `fetchSubtasks` с ошибкой и успехом.

## Критерии приёмки

- [ ] @SC-GANTT-ERR-* покрыты.
- [ ] Cypress проекта зелёный.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-10](./TASK-10-error-state-view.md), [TASK-14](./TASK-14-gantt-data-model.md), [TASK-17](./TASK-17-gantt-chart-container.md)

---

## Результаты

_(заполняется по завершении)_
