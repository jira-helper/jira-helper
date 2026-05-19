# TASK-109: gantt-chart diagnostic

**Status**: TODO
**Type**: model

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic registration для `gantt-chart`: `getDiagnosticSnapshot()` на settings/data/quickFilters/viewport models + callback с localStorage settings и runtime blocks.

## Файлы

```
src/features/gantt-chart/
├── module.ts                           # update register()
├── models/GanttSettingsModel.ts        # getDiagnosticSnapshot
├── models/GanttDataModel.ts            # getDiagnosticSnapshot
├── models/GanttQuickFiltersModel.ts    # getDiagnosticSnapshot
├── models/GanttViewportModel.ts        # getDiagnosticSnapshot
├── *.test.ts                           # extend
└── module.diagnostic.test.ts           # новый
```

## Что сделать

1. `getDiagnosticSnapshot(): FeatureDiagnosticData` на каждую runtime/settings model — plain data only.
2. Register `gantt-chart` callback в `ganttChartModule.register()`.
3. Payload per requirements §5 gantt-chart.
4. Unit test callback + snapshot methods.

## Критерии приёмки

- [ ] Snapshots без DOM, без load/recompute в getter
- [ ] Unit test diagnostic callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 gantt-chart
