# TASK-109: gantt-chart diagnostic

**Status**: DONE
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

- [x] Snapshots без DOM, без load/recompute в getter
- [x] Unit test diagnostic callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `getDiagnosticSnapshot()` на `GanttSettingsModel`, `GanttDataModel`, `GanttQuickFiltersModel`, `GanttViewportModel`
- Регистрация `gantt-chart` в `ganttChartModule.register()` (§5.3: `boardProperty: null`, `localStorage` + `runtime` blocks)
- `module.diagnostic.test.ts` и расширенные unit-тесты snapshot-методов

**Проблемы и решения**:

- `GanttDataModel` snapshot-тест: `tasksWithoutStatusHistoryCount` зависит от changelog — assert через `model.tasksWithoutStatusHistory.length`.
- `GanttQuickFiltersModel.test.ts`: добавлен импорт `vi` для spy в snapshot-тесте.

**Верификация (2026-05-20)**:

- `npm test`: 166 files, 1729 tests — pass
- `npm run lint:eslint -- --fix`: pass (удалён неиспользуемый `user` в `GanttSettingsModal.test.tsx`)

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5 gantt-chart
