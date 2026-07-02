# TASK-25: Storybook — Toolbar, Tooltip, MissingDates

**Status**: VERIFICATION
**Type**: stories

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Stories для интерактивных контролов и секции «issues not shown».

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttToolbar.stories.tsx
├── GanttTooltip.stories.tsx
└── MissingDatesSection.stories.tsx
```

## Что сделать

1. Добавить варианты состояний (разный набор полей, длинные строки, много issues).
2. Следовать [Storybook skill](../../../.cursor/skills/storybook/SKILL.md).

## Критерии приёмки

- [ ] Storybook без ошибок.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-22](./TASK-22-gantt-toolbar.md), [TASK-23](./TASK-23-gantt-tooltip.md), [TASK-24](./TASK-24-missing-dates-section.md)

---

## Результаты

_(заполняется по завершении)_
