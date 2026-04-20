# TASK-5: GanttChartIssuePage (PageModification)

**Status**: TODO
**Type**: page-modification

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Точка входа на `Routes.ISSUE`: ожидание DOM, получение текущей задачи, вставка контейнера через `IssueViewPageObject`, монтирование React-корня (после появления контейнера и DI). До [TASK-17](./TASK-17-gantt-chart-container.md) монтируется упрощённое дерево (например провайдеры DI + `FirstRunState` при отсутствии настроек). В TASK-17 содержимое корня заменяется на `GanttChartContainer` (правка того же `GanttChartIssuePage.ts`).

## Файлы

```
src/features/gantt-chart/IssuePage/
├── GanttChartIssuePage.ts
└── GanttChartIssuePage.test.ts
```

Допустимо при необходимости экспорт токена из этого файла (паттерн как у `FieldLimitsBoardPage`):

```
export const ganttChartIssuePageToken = ...
```

## Что сделать

1. **TDD:** unit-тесты на lifecycle `PageModification` (mock DI/container, `IssueViewPageObject`) — `getModificationId`, `clear`, вызов `apply` с mock data.
2. Реализовать класс по [target-design.md](./target-design.md): `waitForLoading` → `#details-module`, `loadData` → текущий issue через существующий API проекта (как у других issue-модификаций).
3. В `apply` — вставить контейнер, смонтировать React с провайдером DI и заглушкой/первым состоянием, совместимым с [TASK-8](./TASK-8-first-run-state-view.md).

## Критерии приёмки

- [ ] PageModification не ломает существующие issue view модификации.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-2](./TASK-2-issue-view-page-object.md), [TASK-4](./TASK-4-gantt-settings-model.md), [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md)
- Зависит от (UI): [TASK-8](./TASK-8-first-run-state-view.md) — минимум для первого экрана
- Референс: `src/shared/PageModification.ts`, `src/features/sub-tasks-progress/BoardPage.ts` (extends PageModification), `src/issue/MarkFlaggedIssues.ts` (issue route)

---

## Результаты

_(заполняется по завершении)_
