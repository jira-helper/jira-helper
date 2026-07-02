# TASK-26: computeStatusSections

**Status**: VERIFICATION
**Type**: utils

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Разбиение интервала бара на цветные секции по статусам из changelog; категории → `BarStatusCategory` и цвета через `jiraColorScheme` (FR-4).

## Файлы

```
src/features/gantt-chart/utils/
├── computeStatusSections.ts
└── computeStatusSections.test.ts
```

## Что сделать

1. **TDD:** переходы покрывают весь диапазон [barStart, barEnd]; граничные случаи — пустые transitions.
2. Реализовать по [target-design.md](./target-design.md); маппинг категорий Jira → `BarStatusCategory` согласован с `colorSchemas.ts`.

## Критерии приёмки

- [ ] Секции непрерывны по времени в пределах бара.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md), [TASK-12](./TASK-12-parse-changelog-util.md)
- Интеграция в бары: [TASK-13](./TASK-13-compute-bars-util.md) / [TASK-15](./TASK-15-gantt-bar-view.md) при включённом breakdown

---

## Результаты

_(заполняется по завершении)_
