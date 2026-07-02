# TASK-47: BDD hardening — fix sins + close P0 coverage gaps

**Status**: DONE
**Type**: bdd-tests + refactoring

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Аудит BDD-покрытия: три «греха» (unclear Given, localStorage/обход UI в Then, пропущенные P0) + косметика (теги, дубли степов, селекторы). См. полный текст в истории git / первоначальная версия TASK-47.

**Файлы (идея)**: `IssuePage/features/*.{feature,cy.tsx}`, `helpers.tsx`, `steps/*.ts`, точечно `MissingDatesSection`, `GanttBarView`, `GanttToolbar`, `GanttChartIssuePage`, `utils/applyInitialGanttScopeForIssueView.ts`.

---

## Результаты

- **Дата**: 2026-04-22
- **Статус**: DONE (готово к релизу по BDD/тестам gantt-chart)

### Что сделано (итог)

1. **Pass 5 (Quick filters)** — `gantt-chart-quick-filters.feature` (6 P0: QF-1,2,4,5,7,15), `gantt-chart-quick-filters.feature.cy.tsx`, `steps/quickFilters.steps.ts`, `helpers.tsx` (`seedCustomQuickFiltersFromTable`, моки полей). **QF-15**: порядок шагов **сначала** ввод `priority = High` в поиске (Text), **затем** переключение на JQL — иначе кнопка «Save as quick filter» не появляется; нативный input через `data-testid` + обёртка Ant (см. `qfNativeInput`).
2. **SET-2** (тег `@SC-GANTT-SET-2`) — сценарий S3: start/end по date field + status transition, сохранение и поведение формы.
3. **SET-13** (тег `@SC-GANTT-SET-13`) — FR-3: UI fallback end mapping; `data-testid` на строку маппинга `gantt-settings-end-mappings-row-{index}` в `GanttSettingsModal.tsx`; шаг `I add a fallback row…` — `scrollIntoView` + клик по `.ant-select-selector`, затем выбор из портального `.ant-select-dropdown` с `timeout: 15000`.
4. **INT-5** — оставлен упрощённый assert (hover + bar); при необходимости — `GanttTooltip.test.tsx` на уровне Vitest.

### Покрытие

- **Runtime (Cypress CT)**: **22** сценария в `IssuePage/features/*.feature` из **74** в полной Gantt-спеке ≈ **30%** сценариев в `*.feature` под BDD-раннером.
- **TODO в фиче**: `gantt-chart-quick-filters.feature` — строка с QF-3,6,8…19 для follow-up.

### Команды проверки (зелёные)

- `npx cypress run --component --spec "src/features/gantt-chart/IssuePage/features/*.feature.cy.tsx"` — **22** passed
- `npm test -- --run src/features/gantt-chart` — **305** passed
- `npx eslint "src/features/gantt-chart/**/*.{ts,tsx}" --quiet --fix` — OK

**Примечание**: полный `npm run lint:eslint` по всему `src/` может падать на неотносящихся к gantt файлах (например `src/page-objects/BoardPage/module.ts`); для приёмки задачи достаточно линта по `src/features/gantt-chart`.

---

## Зависимости

См. EPIC-1 / TASK-44 / TASK-45; skill `bdd-features-reviewer`, Cypress BDD, BDD writer.

## Критерии приёмки

Выполнены для **gantt-chart**: Cypress BDD (5 spec-файлов), Vitest по `src/features/gantt-chart`, ESLint по `src/features/gantt-chart`. Полнорепозиторный `eslint` — опционально (известны сторонние нарушения вне scope).
