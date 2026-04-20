# TASK-18: Storybook — GanttBarView и GanttChartView

**Status**: TODO
**Type**: stories

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Stories для визуальной проверки баров и общего графика (несколько задач, open-ended, сегменты после TASK-26).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttBarView.stories.tsx
└── GanttChartView.stories.tsx
```

## Что сделать

1. Собрать фикстуры `GanttBar` из типов [TASK-1](./TASK-1-types-and-tokens.md).
2. Stories: много баров, узкий диапазон дат, предупреждение open-ended.

## Критерии приёмки

- [ ] Storybook собирается.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-15](./TASK-15-gantt-bar-view.md), [TASK-16](./TASK-16-gantt-chart-view.md)

---

## Результаты

_(заполняется по завершении)_
