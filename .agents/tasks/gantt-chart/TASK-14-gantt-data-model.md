# TASK-14: GanttDataModel

**Status**: VERIFICATION
**Type**: model

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Загрузка связанных задач через `JiraService.fetchSubtasks` с `expand: ['changelog']`, вычисление баров через `computeBars`, состояния loading/error/empty.

## Файлы

```
src/features/gantt-chart/models/
├── GanttDataModel.ts
└── GanttDataModel.test.ts
# + правка src/features/gantt-chart/module.ts (регистрация ganttDataModelToken — третий файл)
```

*Примечание:* правка `module.ts` — расширение DI после [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md).

## Что сделать

1. **TDD:** мок `IJiraService` — успех, ошибка, abort, `recompute` без сети.
2. Реализовать модель по [target-design.md](./target-design.md); использовать [TASK-13](./TASK-13-compute-bars-util.md).
3. Зарегистрировать `ganttDataModelToken` в `GanttChartModule`.

## Критерии приёмки

- [ ] Соответствует FR-1 (загрузка с changelog).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md), [TASK-13](./TASK-13-compute-bars-util.md)
- Референс: `src/shared/jira/jiraService.ts` (`fetchSubtasks`)

---

## Результаты

_(заполняется по завершении)_
