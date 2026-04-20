# TASK-23: GanttTooltip

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Позиционируемый тултип с полями из настроек (FR-8, S12).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttTooltip.tsx
├── GanttTooltip.module.css
└── GanttTooltip.test.tsx
```

## Что сделать

1. **TDD:** отображение полей и позиции; пустые значения как «-» ([gantt-chart-interactions.feature](./gantt-chart-interactions.feature) @SC-GANTT-INT-6).
2. Реализовать `GanttTooltipProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Тултип не обрезается критично при краях viewport (минимальная логика flip/offset).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)

---

## Результаты

_(заполняется по завершении)_
