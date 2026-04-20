# TASK-2: IssueViewPageObject

**Status**: TODO
**Type**: page-object

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Единственная точка работы с DOM issue view: вставка контейнера Gantt под `#details-module` и селекторы для тестов/модификаций. Соответствует спецификации в [target-design.md](./target-design.md).

## Файлы

```
src/features/gantt-chart/page-objects/
├── IssueViewPageObject.ts
└── IssueViewPageObject.test.ts
```

## Что сделать

1. **TDD:** написать тесты на `insertGanttContainer` / `removeGanttContainer` (jsdom или существующий паттерн page-object тестов в проекте) — ожидаемые селекторы и поведение.
2. Реализовать `IssueViewPageObject` с `selectors.detailsBlock`, `selectors.ganttContainer`; методы вставки/удаления контейнера после блока деталей.
3. Убедиться, что класс не тянет React — только DOM.

## Критерии приёмки

- [ ] Unit-тесты проходят для page object.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md) (опционально — константы селекторов можно держать локально)
- Референс PageObject: `src/features/field-limits/BoardPage/page-objects/FieldLimitsBoardPageObject.ts`
- Референс DI-токена page object: `field-limits/tokens.ts` (`fieldLimitsBoardPageObjectToken`) — регистрация в [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md)

---

## Результаты

_(заполняется по завершении)_
