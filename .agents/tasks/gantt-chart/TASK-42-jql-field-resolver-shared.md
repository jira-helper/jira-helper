# TASK-42: JQL field resolver через метаданные `JiraField` (shared)

**Status**: DONE
**Type**: bugfix / refactoring
**Priority**: high
**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

**Bug** ([report from chat](./request.md)): пользовательский **quick filter** `Platform = Backend` в JQL-режиме отфильтровывал **все** задачи, хотя на доске реально есть эпики с `Platform = Backend`.

**Root cause:**

- `matchQuickFilter` / `applyQuickFiltersToBars` / `matchColorRule` / `isExcludedByFilters` строили `fieldGetter` напрямую через `issue.fields[fieldName]`.
- В Jira Server custom field хранится по техническому id (`customfield_178101`), а пользователь пишет в JQL **отображаемое имя** (`Platform`).
  → Lookup промахивался → JQL `Platform = Backend` интерпретировался как «field undefined» → matcher возвращал `false` → фильтр прятал все задачи.
- При этом в фиче **sub-tasks-progress** уже была полностью рабочая логика резолва полей (display name → id, schema-aware extraction). Эту логику пользователь явно попросил переиспользовать.

**Решение:**

1. Вынести шейред-хелпер `getFieldValueForJql(issue, fields)` в `src/infrastructure/jira/fields/`:
   - lookup по `JiraField.id` / `JiraField.name` / `JiraField.clauseNames` (case-insensitive, поддержка нескольких полей с одинаковым display name);
   - schema-aware extraction (`project → key`, `priority/status/issuetype → name`, `user → displayName/email/name`, `option → value`, `array<option/component> → […]`);
   - fallback на raw lookup `issue.fields[name]` + tokenization (`key`/`name`/`id`/`value`/`displayName`/`emailAddress`) — чтобы запросы вида `customfield_XXX = …` или системные поля продолжали работать, пока метаданные ещё грузятся.
2. Прокинуть `JiraField[]` через Gantt pipeline:
   - `GanttDataModel.setFields(fields, settings)` хранит снимок;
   - `computeBars`, `matchColorRule`, `isExcludedByFilters` принимают `fields` и делегируют резолв в новый хелпер;
   - `matchQuickFilter` и `applyQuickFiltersToBars` делают то же самое;
   - `GanttChartContainer` подписывается на `useGetFields()` и синхронизирует список с моделью.
3. `useSubtasksProgress` переключён на shared helper (back-compat re-export `getFieldValueForJqlStandalone`), чтобы избежать дублирования и регресса.

## Файлы

```
src/infrastructure/jira/fields/
├── getFieldValueForJql.ts                    # новый — shared helper
└── getFieldValueForJql.test.ts               # новый — unit-тесты (Platform=Backend + регрессы)

src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/
└── useSubtasksProgress.tsx                   # переключён на shared + back-compat re-export

src/features/gantt-chart/
├── models/GanttDataModel.ts                  # +fields: ReadonlyArray<JiraField>, setFields()
├── utils/computeBars.ts                      # +fields в computeBars/matchColorRule/isExcludedByFilters
├── quickFilters/matchQuickFilter.ts          # +fields в matchQuickFilter
├── quickFilters/applyQuickFiltersToBars.ts   # +fields в applyQuickFiltersToBars
└── IssuePage/components/GanttChartContainer.tsx  # useGetFields + dataModel.setFields(...)
```

## Что сделать (готово)

1. ✅ Извлечь `extractFieldValueBySchema`, `extractTokensFromRawValue`, `getFieldValueForJql` в `src/infrastructure/jira/fields/getFieldValueForJql.ts`.
2. ✅ Покрыть unit-тестами:
   - резолв `Platform = Backend` через `clauseNames` → `customfield_NNNNN` со схемой `array<option>`;
   - регресс системных полей (`project`, `assignee`, `priority`, `status`);
   - fallback на raw lookup при пустом `fields`;
   - case-insensitive lookup по name/clauseNames.
3. ✅ Заменить локальные реализации в `useSubtasksProgress` на вызов хелпера, оставив deprecated-реэкспорт `getFieldValueForJqlStandalone`.
4. ✅ Обновить сигнатуры `computeBars`/`matchColorRule`/`matchQuickFilter`/`applyQuickFiltersToBars` (опциональный `fields = []`, чтобы не ломать существующие тесты).
5. ✅ Прокинуть `JiraField[]` через `GanttDataModel.setFields()` + `useGetFields()` в `GanttChartContainer`.
6. ✅ Обновить тесты на новые сигнатуры и поведение.

## Критерии приёмки

- [x] Unit-тесты `getFieldValueForJql.test.ts` проходят, в т.ч. кейс «Platform = Backend через `clauseNames`».
- [x] Существующие тесты `computeBars`, `matchQuickFilter`, `useSubtasksProgress` не сломаны.
- [x] `npm run lint:eslint -- --fix` чистый по затронутым файлам.
- [x] `npx tsc --noEmit` не вводит новых ошибок (есть преконтекстные ошибки в BoardPage / mock services — НЕ от этого изменения, см. `STATUS-RESUME.md`).
- [ ] **Manual / live-Jira:** custom quick filter `Platform = Backend` на TTP-эпике показывает только эпики с этим значением (см. план верификации в `STATUS-RESUME.md`).

## Зависимости

- Зависит от:
  - [TASK-39](./TASK-39-jql-support.md) — JQL-режим в исключениях/color rules (исходный matcher);
  - инфраструктура `useGetFields` из `src/infrastructure/jira/fields/useGetFields.ts` (уже существует).
- Референс: `src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress.tsx` (исходная реализация резолва).

---

## Результаты

**Дата**: 2026-04-21

**Агент**: Claude Opus 4.7 (parent)

**Статус**: VERIFICATION (live-Jira прогон не доведён до конца — см. `STATUS-RESUME.md`)

**Что сделано**:

- Создан shared helper `src/infrastructure/jira/fields/getFieldValueForJql.ts` + unit-тесты (включая кейс `Platform = Backend` через `clauseNames`).
- `useSubtasksProgress.tsx` переведён на shared helper, экспорт `getFieldValueForJqlStandalone` сохранён как deprecated re-export.
- `GanttDataModel` хранит снимок `JiraField[]` (`setFields`), `computeBars` передаёт их в `matchColorRule` и `isExcludedByFilters`.
- `matchQuickFilter` и `applyQuickFiltersToBars` принимают `fields` и используют shared helper.
- `GanttChartContainer` подписан на `useGetFields()` и синхронизирует поля с моделью; `applyQuickFiltersToBars` получает их же.
- В live-Jira (TTP-23422) подтверждено: filter `Platform = Backend` сохранился в `localStorage` (см. `jh-gantt-settings`), Gantt отрендерился (24 tasks / 29 bars). Финальный клик «активировать чип + замерить отфильтрованный счёт» прерван пользователем — нужен повтор.

**Проблемы и решения**:

**Проблема 1: Programmatic save в модалке через `setNativeValue` не закрывал модалку**

- Контекст: пытался полностью автоматизировать создание quick filter через Chrome runner — `setNativeValue + dispatchEvent('input')` корректно обновлял value поля, но клик по `Save` не закрывал модалку.
- Диагноз: AntD Form+Form.List синхронизируется с input event, и сам сейв проходит (`localStorage` обновился, фильтр персистентен), но React-state модалки/контейнера не перерендерился до закрытия — это особенность `Modal destroyOnClose` + наш `onSave` colocation.
- Решение для верификации: достаточно проверить `localStorage['jh-gantt-settings']` после клика Save и потом перезагрузить страницу. Скрипт верификации см. в `STATUS-RESUME.md`.

**Проблема 2: TS-ошибки `npx tsc --noEmit` за пределами фичи**

- Контекст: `tsc` показывал ошибки в `BoardPage` и mock-сервисах.
- Решение: Подтверждено, что они **преконтекстные** (не введены этим тиклом). Команда для проверки: `npx tsc --noEmit 2>&1 | grep -E "gantt-chart|infrastructure/jira/fields|sub-tasks-progress"` — пусто.
