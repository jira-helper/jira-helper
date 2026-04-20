# TASK-32: Cypress BDD — display scenarios

**Status**: TODO
**Type**: bdd-tests

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Реализация шагов и `.cy.tsx` спецификаций для [gantt-chart-display.feature](./gantt-chart-display.feature): отображение баров, open-ended, missing dates, статусные секции, фильтры связей, пустые данные, производительность 50+.

## Файлы

```
# пути уточнить по структуре Cypress в репозитории, например:
src/features/gantt-chart/**/*.cy.tsx
cypress/support/step-definitions/gantt-chart-display.ts   # если используется слой шагов
```

## Что сделать

1. Изучить [cypress-bdd-testing skill](../../../.cursor/skills/cypress-bdd-testing/SKILL.md) и существующие `.cy.tsx` в проекте.
2. **TDD с точки зрения BDD:** сопоставить каждый @SC-GANTT-DISP-* с тестом; застабить Jira API/DI по паттерну проекта.
3. Реализовать недостающие `data-testid` / page objects в компонентах Gantt.

## Критерии приёмки

- [ ] Все сценарии из [gantt-chart-display.feature](./gantt-chart-display.feature) автоматизированы или явно помечены как skip с причиной.
- [ ] `npm run cypress` / команда проекта для component/integration тестов проходит.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-17](./TASK-17-gantt-chart-container.md) и связанные view/model задачи по сценариям
- Референс: другие `*.cy.tsx` в `src/features/`

---

## Результаты

_(заполняется по завершении)_
