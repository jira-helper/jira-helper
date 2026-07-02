# TASK-41: Тултипы не работают — GanttTooltip не подключён

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
`GanttTooltip` компонент существует, но НЕ рендерится в `GanttChartContainer`.
`GanttChartView` принимает `onBarHover` prop, но он не передаётся из контейнера.

Нужно:
1. Добавить state для hoveredBar и mouse position в GanttChartContainer
2. Передать onBarHover в GanttChartView
3. Рендерить GanttTooltip в ganttBody

## Файлы
- `src/features/gantt-chart/IssuePage/components/GanttChartContainer.tsx`
