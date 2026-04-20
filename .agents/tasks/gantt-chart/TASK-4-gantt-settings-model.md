# TASK-4: GanttSettingsModel

**Status**: TODO
**Type**: model

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Модель каскадных настроек: чтение/запись `localStorage` (`jh-gantt-settings`), разрешение через `resolveSettings`, черновик модалки, `copyFrom`, переключение scope, флаг разбивки по статусам. Valtio + паттерн `modelEntry` как в target design.

## Файлы

```
src/features/gantt-chart/models/
├── GanttSettingsModel.ts
└── GanttSettingsModel.test.ts
```

## Что сделать

1. **TDD:** тесты на load/save, `isConfigured`, смену draft scope, `copyFromScope`, `saveDraft`, `toggleStatusBreakdown`, граничные случаи пустого storage.
2. Реализовать `GanttSettingsModel` по интерфейсу из [target-design.md](./target-design.md); использовать `resolveSettings` / `buildScopeKey` из [TASK-3](./TASK-3-resolve-settings-util.md).
3. Не подключать UI и Jira API — только `Logger` при необходимости.

## Критерии приёмки

- [ ] Поведение соответствует FR-10, FR-11 (состояние модалки — задел под Phase 4).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-3](./TASK-3-resolve-settings-util.md)
- Референс модели: `src/features/field-limits/property/PropertyModel.ts` или другие `*Model.ts` с Valtio в фиче

---

## Результаты

_(заполняется по завершении)_
