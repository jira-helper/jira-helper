# TASK-37: Color rules не применяются к колбаскам

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
При настройке color rules цвета не отображаются на колбасках. Нужно убедиться что:
1. `matchColorRule` корректно сравнивает значения полей
2. `barColor` проставляется в bar и рендерится в `GanttBarView`
3. При сохранении settings с colorRules — bars пересчитываются

## Файлы
- `src/features/gantt-chart/utils/computeBars.ts`
- `src/features/gantt-chart/IssuePage/components/GanttBarView.tsx`

## Критерии приёмки
- [ ] Color rules определяют цвет колбаски (first match wins)
- [ ] Тест: bar с matching rule получает barColor
- [ ] Тест: GanttBarView рендерит rect с fill=barColor
- [ ] ESLint + тесты
