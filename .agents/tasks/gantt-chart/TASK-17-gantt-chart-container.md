# TASK-17: GanttChartContainer

**Status**: TODO
**Type**: container

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Связка `GanttSettingsModel`, `GanttDataModel`, `GanttViewportModel` с ветвлением UI: FirstRun / Loading / Error / Empty / Chart + тулбар/тултип/секции по мере готовности компонентов.

## Файлы

```
src/features/gantt-chart/IssuePage/
├── GanttChartContainer.tsx
├── GanttChartContainer.test.tsx
└── GanttChartIssuePage.ts     # изменение — монтирование GanttChartContainer вместо заглушки TASK-5
```

## Что сделать

1. **TDD:** с моками DI/`useModel` — переходы состояний при изменении snapshot моделей.
2. Реализовать props (`issueId`, `projectKey`, `issueType`) и подключение ко всем зарегистрированным моделям.
3. Смонтировать [TASK-8](./TASK-8-first-run-state-view.md)–[TASK-10](./TASK-10-error-state-view.md), [TASK-16](./TASK-16-gantt-chart-view.md), далее toolbar/tooltip/missing по задачам Phase 3–4.

## Критерии приёмки

- [ ] Нет лишних запросов к API при отсутствии настроек (FirstRun).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-5](./TASK-5-gantt-chart-issue-page.md), [TASK-4](./TASK-4-gantt-settings-model.md), [TASK-14](./TASK-14-gantt-data-model.md), [TASK-20](./TASK-20-gantt-viewport-model.md), [TASK-7](./TASK-7-extension-config-content.md), [TASK-8](./TASK-8-first-run-state-view.md)–[TASK-10](./TASK-10-error-state-view.md), [TASK-16](./TASK-16-gantt-chart-view.md), Phase 3–4 по мере подключения Toolbar/Tooltip/Settings
- Референс контейнера: другие `*Container.tsx` в `src/features/`

---

## Результаты

_(заполняется по завершении)_
