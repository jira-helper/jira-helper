# TASK-6: GanttChartModule (DI wiring)

**Status**: VERIFICATION
**Type**: di-wiring

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Зарегистрировать в DI `GanttSettingsModel` и `IssueViewPageObject`. Регистрацию `GanttDataModel` и `GanttViewportModel` добавить в [TASK-14](./TASK-14-gantt-data-model.md) и [TASK-20](./TASK-20-gantt-viewport-model.md) соответственно (обновления `module.ts`). Без правок `content.ts`.

## Файлы

```
src/features/gantt-chart/
├── module.ts
├── module.test.ts
└── index.ts          # реэкспорт module + публичные символы по необходимости
```

## Что сделать

1. **TDD:** тест `module.test.ts` — после `ganttChartModule.ensure(container)` резолвятся `ganttSettingsModelToken` и токен page object для issue view.
2. Реализовать `GanttChartModule extends Module`: регистрация `GanttSettingsModel` (logger), lazy для `IssueViewPageObject` из [TASK-2](./TASK-2-issue-view-page-object.md).
3. Экспорт `ganttChartModule` как в [target-design.md](./target-design.md) / `field-limits/module.ts`.

## Критерии приёмки

- [ ] `ganttChartModule.ensure` не ломает существующие модули.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-2](./TASK-2-issue-view-page-object.md), [TASK-4](./TASK-4-gantt-settings-model.md)
- Следующие шаги по DI: [TASK-14](./TASK-14-gantt-data-model.md) — `ganttDataModelToken`; [TASK-20](./TASK-20-gantt-viewport-model.md) — `ganttViewportModelToken`
- Референс: `src/features/field-limits/module.ts`, `src/shared/di/Module.ts`

---

## Результаты

_(заполняется по завершении)_
