# TASK-15: GanttBarView

**Status**: TODO
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Одна горизонтальная «колбаска»: однотонная или с сегментами (после TASK-26 данные для сегментов уже в `GanttBar`). SVG `<rect>` / `<text>` для доступности Ctrl+F (FR, requirements §8 open questions).

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttBarView.tsx
├── GanttBarView.module.css
└── GanttBarView.test.tsx
```

## Что сделать

1. **TDD:** рендер при заданных x/y/width/height; опционально снимок сегментов при `statusBreakdownEnabled`.
2. Реализовать props из [target-design.md](./target-design.md); цвета статусов — `jiraColorScheme` / [TASK-26](./TASK-26-compute-status-sections-util.md) когда доступно.

## Критерии приёмки

- [ ] Label отображается как текст SVG/ DOM для поиска.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)
- Референс цветов: `src/features/sub-tasks-progress/colorSchemas.ts`

---

## Результаты

_(заполняется по завершении)_
