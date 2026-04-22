# TASK-19: computeTimeScale

**Status**: VERIFICATION
**Type**: utils

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Чистая функция: домен дат, ширина viewport, интервал (`hours` | `days` | `weeks` | `months`), zoom — конфиг для `d3-scale` и формат тиков ([target-design.md](./target-design.md), `computeTimeScaleConfig`).

## Файлы

```
src/features/gantt-chart/utils/
├── computeTimeScale.ts
└── computeTimeScale.test.ts
```

## Что сделать

1. **TDD:** снимки числа тиков и формата для каждого `TimeInterval` при фиксированных входах.
2. Реализовать без DOM; использовать `d3-scale` / `d3-time` при необходимости.

## Критерии приёмки

- [ ] Покрыты все `TimeInterval` из типов.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)
- Потребитель: [TASK-16](./TASK-16-gantt-chart-view.md), [TASK-21](./TASK-21-gantt-chart-view-d3-zoom.md)

---

## Результаты

_(заполняется по завершении)_
