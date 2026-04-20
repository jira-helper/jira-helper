# TASK-40: Settings modal открывается под fullscreen modal

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
Settings modal (zIndex default 1000) открывается ПОД fullscreen modal (тоже 1000).
Нужно задать `zIndex` чтобы settings modal была всегда поверх fullscreen.

## Файлы
- `src/features/gantt-chart/IssuePage/components/GanttSettingsModal.tsx`
- `src/features/gantt-chart/IssuePage/components/GanttFullscreenModal.tsx`
