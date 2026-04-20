# TASK-7: Конфигурация расширения (content.ts, сборка)

**Status**: TODO
**Type**: config

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Подключить фичу к entry point: `ganttChartModule.ensure`, зарегистрировать `GanttChartIssuePage` как value-token, добавить в `Routes.ISSUE`. При первом использовании `d3-*` — добавить зависимости в `package.json` и при необходимости правки webpack/vite (в этом же task при появлении импортов из TASK-16/TASK-21).

## Файлы

```
src/content.ts                    # изменение — imports, initDiContainer, Routes.ISSUE
package.json                      # изменение — при добавлении d3-scale / d3-zoom / d3-selection
# при необходимости:
webpack.config.* / vite.config.*  # изменение
static/manifest.json              # изменение — только если требуется для бандла
```

## Что сделать

1. Импортировать `ganttChartModule` и класс page modification + токен из `GanttChartIssuePage` ([TASK-5](./TASK-5-gantt-chart-issue-page.md)).
2. Вызвать `ganttChartModule.ensure(container)` рядом с другими `*Module.ensure`.
3. Зарегистрировать токен: `container.register({ token: ganttChartIssuePageToken, value: new GanttChartIssuePage(container) })` (паттерн как `FieldLimitsBoardPage`).
4. Добавить `container.inject(ganttChartIssuePageToken)` в массив `[Routes.ISSUE]` после существующих модификаций.
5. Когда в коде появляются зависимости d3 — добавить пакеты и проверить сборку (можно отложить до первой компиляции с d3, но задача остаётся точкой правок конфига).

## Критерии приёмки

- [ ] На issue view подключается новая модификация без ошибок в консоли при старте.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`
- [ ] Сборка проходит: `npm run build` (или команда проекта)

## Зависимости

- Зависит от: [TASK-5](./TASK-5-gantt-chart-issue-page.md) (экспорт токена и класса), [TASK-6](./TASK-6-gantt-chart-module-di-wiring.md)
- Референс: `src/content.ts` (строки с `fieldLimitsModule`, `Routes.ISSUE`)

---

## Результаты

_(заполняется по завершении)_
