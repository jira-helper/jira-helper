# TASK-45: BDD-coverage для indicator tags (no-history / missing-dates)

**Status**: DONE
**Type**: bdd-tests

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Зафиксировать в `.feature` файлах два пользовательских сценария, реализованных в последней сессии (см. [STATUS-RESUME.md](./STATUS-RESUME.md), пункт P4), но не покрытых BDD-сценариями — два жёлтых индикатора в `GanttToolbar` с tooltip-таблицей по проблемным задачам:

- `gantt-no-history-tag` — `No history for X of Y tasks` (видим только если есть задачи без changelog-переходов в окне `[barStart, barEnd]`).
- `gantt-missing-dates-tag` — `X tasks not on chart` (видим только если `dataSnap.missingDateIssues.length > 0`).

Юнит-тесты на них уже есть (`GanttToolbar.test.tsx` — раздел indicator tags); Storybook stories `WithPartialStatusHistory`, `WithMissingDateIssues`. Не хватает acceptance-сценариев в `.feature`-файлах.

> **P1 (stopJiraHotkeys) — НЕ покрываем BDD.** Это технический guard, который должен жить как ESLint-правило (no-untrapped-input-in-extension-modal) или unit-тест. BDD не подходит — пользовательский сценарий «нажми hotkey» неестественен в acceptance-наборе.

## Файлы

```
.agents/tasks/gantt-chart/
└── gantt-chart-display.feature        # +2 сценария: SC-GANTT-DISP-24 no-history tag, SC-GANTT-DISP-25 missing-dates tag
```

## Что сделать

1. В `gantt-chart-display.feature` после `@SC-GANTT-DISP-23` добавить два сценария:
   - `@SC-GANTT-DISP-24` — Yellow `No history for X of Y tasks` tag is visible when at least one bar has no status transitions; tooltip lists Issue/Summary; tag hides when all bars have history.
   - `@SC-GANTT-DISP-25` — Yellow `X tasks not on chart` tag is visible when `missingDateIssues.length > 0`; tooltip lists Issue/Summary/Reason; tag hides when there are no missing-date issues.
2. Использовать существующий `Background:` стиль (issue ROOT + linked issues + Gantt settings table). Тэги-теги (`@SC-GANTT-...`) — уникальные.
3. Не менять существующие сценарии и нумерацию.
4. Соблюдать тон и структуру существующих `.feature`-файлов (Given/When/Then, теги, AAA).

## Критерии приёмки

- [ ] В `gantt-chart-display.feature` присутствуют `@SC-GANTT-DISP-24` (no-history tag) и `@SC-GANTT-DISP-25` (missing-dates tag).
- [ ] Каждый новый сценарий — атомарный, ровно один Scenario.
- [ ] Тэги уникальны в рамках папки фичи.
- [ ] Стилистика — Given/When/Then на английском, как в существующих сценариях.
- [ ] Не сломаны существующие сценарии (быстрый просмотр diff).

## Зависимости

- Реализация P4 уже в коде (см. [STATUS-RESUME.md](./STATUS-RESUME.md)).
- Юнит-тесты уже есть: `src/features/gantt-chart/IssuePage/components/GanttToolbar.test.tsx` (раздел indicator tags).
- Storybook: `GanttToolbar.stories.tsx` — `WithPartialStatusHistory`, `WithMissingDateIssues`.

---

## Результаты

**Дата**: 2026-04-22
**Агент**: generalPurpose
**Статус**: VERIFICATION

**Что сделано**:
- Добавлены два BDD-сценария в `.agents/tasks/gantt-chart/gantt-chart-display.feature` (+120 строк):
  - `@SC-GANTT-DISP-24` — `No history for X of Y tasks` тэг (singular/plural, focusable, tooltip Issue/Summary, скрывается, когда у всех задач есть история).
  - `@SC-GANTT-DISP-25` — `X tasks not on chart` тэг (singular/plural, focusable, tooltip Issue/Summary/Reason, скрывается, когда missing-dates нет).
- Hotkeys (P1) намеренно не покрыт BDD — по решению пользователя это lint-правило, не acceptance.
- Существующие сценарии и нумерация не изменены.

**Проблемы и решения**: нет (Change Control маркеров не было — requirements/реализация полностью покрыли scope).
