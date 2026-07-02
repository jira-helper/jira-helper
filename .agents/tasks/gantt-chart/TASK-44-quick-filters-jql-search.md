# TASK-44: Quick filters — JQL search mode + Save as chip

**Status**: DONE
**Type**: feature (model + util + view + tests + i18n)

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Расширить live-search в `GanttToolbar` (FR-17): помимо существующего text-режима (substring по `KEY: summary`) добавить режим **JQL** (`parseJql` + `getFieldValueForJql`, graceful-fallback при ошибке) и кнопку **Save as quick filter** для сохранения текущего JQL как нового chip-пресета в текущем scope.

Требование зафиксировано в `requirements.md` FR-17 и acceptance, BDD-сценарии — `gantt-chart-quick-filters.feature` `@SC-GANTT-QF-13..19`.

## Файлы

```
src/features/gantt-chart/
├── models/
│   ├── GanttQuickFiltersModel.ts          # +searchMode + setSearchMode + clear() resets mode
│   ├── GanttQuickFiltersModel.test.ts     # + tests
│   ├── GanttSettingsModel.ts              # + appendQuickFilterToCurrentScope(qf): persists to storage
│   └── GanttSettingsModel.test.ts         # + tests
├── quickFilters/
│   ├── applyQuickFiltersToBars.ts         # signature: search → { mode, value } + jql matching path
│   └── quickFilters.test.ts               # + tests for JQL search + invalid JQL graceful + empty
└── IssuePage/components/
    ├── GanttToolbar.tsx                   # Segmented [Text|JQL] + JQL validation UI + Save popover
    ├── GanttToolbar.test.tsx              # + tests for toggle, validation, save flow
    ├── GanttToolbar.stories.tsx           # + WithJqlSearch + WithJqlSearchInvalid + WithSavePopoverOpen
    └── GanttChartContainer.tsx            # propagate searchMode + onSaveJqlAsQuickFilter wiring
```

## Что сделать

1. **Model: `GanttQuickFiltersModel`**
   - Добавить поле `searchMode: 'text' | 'jql' = 'text'`.
   - Добавить метод `setSearchMode(mode: 'text' | 'jql'): void`.
   - В `clear()` сбрасывать также `searchMode = 'text'`.
   - Тест: setSearchMode меняет, clear возвращает в text, search value не трогается при смене режима.

2. **Util: `applyQuickFiltersToBars`**
   - Поменять сигнатуру: вместо `searchQuery: string` — `search: { mode: 'text' | 'jql'; value: string }`.
   - В режиме `text` — текущая логика (`bar.label.includes(query)`).
   - В режиме `jql` — `parseJql(value)` (если не пустой и парсится). Для каждого `bar` достать `issue` через `issuesByKey`, прогнать через `matcher(getFieldValueForJql(issue, fields))`. На invalid JQL (`parseJql` бросил) или пустую строку — пасс через всё (graceful, см. `matchQuickFilter` для эталона).
   - Обновить вызывающий код в `GanttChartContainer` (передать объект из `quickFiltersSnap`).
   - Тесты: text-режим (легаси), jql-режим фильтрует, invalid jql пропускает всё, empty jql не фильтрует, custom-field по display name работает (Platform = Backend).

3. **Model: `GanttSettingsModel`**
   - Новый метод `appendQuickFilterToCurrentScope(qf: QuickFilter): void`:
     - Берёт `directSettings`; если `null` — клонирует `resolvedSettings` (cascade base) либо `createDefaultScopeSettings()`, чтобы создать direct-запись на текущем scope.
     - Добавляет `qf` в конец `quickFilters` (immutable copy).
     - Пишет в `storage[scopeKeyFromScope(currentScope)]` и зовёт `this.save()`.
   - Тесты: добавление в пустой scope (создаёт direct); в существующий direct (apend); persist в storage; работает на разных scope levels.

4. **View: `GanttToolbar`**
   - Слева от `<Input>` (внутри quick-filters row, перед `<Input>`) — `<Segmented>` `[Text|JQL]` с `value={searchMode}` + `onChange={onSearchModeChange}`. Маленький размер (`size="small"`).
   - Placeholder зависит от режима: text — старый `quickFiltersSearchPlaceholder`; jql — новый `quickFiltersJqlSearchPlaceholder` (`e.g. assignee = currentUser() AND priority = High` / `например assignee = currentUser() AND priority = High`).
   - Ширина input в JQL-режиме — 380px (вместо 220px).
   - При JQL-режиме делать live-парсинг через `parseJql`: при ошибке — `<Input status="error">` + `<Tooltip title={errorMessage}>`. Использовать тот же `parseJql` что в `matchQuickFilter`.
   - Кнопка **Save as quick filter** (`<Button size="small" type="default">`) — рендерится только когда `searchMode === 'jql'`, value непустой, valid. По клику — открыть `<Popover>` (или `<Popconfirm>`) с `<Input>` (prefilled `value.slice(0, 40)`) и `<Button>` Save/Cancel. По Save — позвать `onSaveJqlAsQuickFilter({ name, jql })`.
   - Новые i18n ключи: `quickFiltersJqlSearchPlaceholder`, `quickFiltersSaveAsChip` (`Save as quick filter` / `Сохранить как чип`), `quickFiltersSavePopoverNameLabel`, `quickFiltersSavePopoverSave`, `quickFiltersSavePopoverCancel`, `quickFiltersJqlInvalid` (`Invalid JQL` / `Неверный JQL`).
   - Тесты:
     - Toggle меняет режим (через `onSearchModeChange`).
     - Невалидный JQL → input получает `status="error"` + tooltip.
     - Save кнопка скрыта в text/empty/invalid jql режимах; видна при valid jql.
     - Click Save → popover, fill name, click Save → `onSaveJqlAsQuickFilter` вызван с `{name, jql}`.
   - Stories: `WithJqlSearch` (валидный JQL), `WithJqlSearchInvalid`, `WithSavePopoverOpen`.

5. **Container: `GanttChartContainer`**
   - Прокинуть `quickFiltersSnap.searchMode` в `<GanttToolbar searchMode=... onSearchModeChange={mode => quickFiltersModel.setSearchMode(mode)}>`.
   - В `applyQuickFiltersToBars` передать `{ mode: quickFiltersSnap.searchMode, value: quickFiltersSnap.searchQuery }` + `fields: jiraFields ?? []`.
   - `useMemo` deps — добавить `searchMode`.
   - Реализовать `onSaveJqlAsQuickFilter`:
     ```ts
     const handleSaveJql = ({ name, jql }) => {
       const id = crypto.randomUUID();
       settingsModel.appendQuickFilterToCurrentScope({ id, name, selector: { mode: 'jql', jql } });
       quickFiltersModel.setSearch('');
       quickFiltersModel.setSearchMode('text');
       quickFiltersModel.toggle(id); // активировать новый chip
     };
     ```
   - Прокинуть в `<GanttFullscreenModal>` тоже (там используется тот же тулбар).

6. **i18n** — обновить `GANTT_TOOLBAR_TEXTS` и расширить тип ключей в `GanttToolbarTextsKey`.

## Критерии приёмки

- [ ] FR-17 acceptance bullets закрыты (см. requirements.md).
- [ ] BDD сценарии `@SC-GANTT-QF-13..19` соответствуют реализации (на ручную верификацию через Storybook + test).
- [ ] Существующие тесты `quickFilters.test.ts`, `GanttQuickFiltersModel.test.ts`, `GanttToolbar.test.tsx`, `GanttSettingsModel.test.ts` не сломаны (или обновлены под новую сигнатуру).
- [ ] `GanttToolbar.stories.tsx` — три новых story: `WithJqlSearch`, `WithJqlSearchInvalid`, `WithSavePopoverOpen`.
- [ ] При невалидном JQL: красная рамка, tooltip, диаграмма НЕ пустеет.
- [ ] При нажатии Save в popover: chip создаётся, search очищается, режим возвращается в text, новый chip активен.
- [ ] `clear()` ресетит и `searchMode` в `text`.
- [ ] Тесты проходят: `npx vitest run src/features/gantt-chart`.
- [ ] Линтер чистый: `npx eslint src/features/gantt-chart`.
- [ ] Build проходит: `npm run build:dev`.
- [ ] Никаких регрессов: `quickFiltersSearch` text-режим работает идентично текущему поведению (substring on `KEY: summary`).

## Зависимости

- Базируется на:
  - [TASK-42](./TASK-42-jql-field-resolver-shared.md) — shared `getFieldValueForJql` (FR-18). Без него custom-fields в JQL не резолвились бы.
  - `src/shared/jql/simpleJqlParser.ts` — `parseJql` (используется уже в `matchQuickFilter`).
- Затронутые артефакты:
  - `requirements.md` — расширен FR-17 (изменения уже сделаны в чате 2026-04-21).
  - `gantt-chart-quick-filters.feature` — добавлены SC-13..19 (изменения уже сделаны).
  - `EPIC-1-gantt-chart.md` — Phase 7, добавить строку TASK-44.

## Референсы

- Существующая JQL-валидация в settings — `GanttSettingsModal.tsx` (поиск по `parseJql` + Form validator).
- Graceful-fallback для invalid JQL — `quickFilters/matchQuickFilter.ts` (try/catch вокруг parseJql).
- Existing search input layout — `GanttToolbar.tsx:303-313`.

---

## Результаты

**Дата**: 2026-04-21
**Агент**: Coder + Orchestrator (фиксы) + QA
**Статус**: VERIFICATION

**Что сделано**:

- `GanttQuickFiltersModel.ts` — добавлены `searchMode: 'text' | 'jql'`, `setSearchMode()`, `clear()` сбрасывает в `text`. + тесты.
- `GanttSettingsModel.ts` — добавлен `appendQuickFilterToCurrentScope(qf)` (создаёт direct settings из cascaded resolved или defaults; persist через `save()`). Удалена мёртвая `draftFromResolved`. + тесты на пустой scope, существующий direct, projectIssueType, persist в localStorage.
- `applyQuickFiltersToBars.ts` — сигнатура `searchQuery: string` → `search: { mode, value }`. JQL-режим через `parseJql` + `getFieldValueForJql`, graceful fallback на invalid/empty JQL. + тесты JQL / invalid / empty / Platform = Backend по display name.
- `GanttToolbar.tsx` — `<Segmented>` `[Text|JQL]` слева от input (с i18n `aria-label`), live-валидация JQL (red border + `<Tooltip>` + `aria-invalid`), кнопка `Save as quick filter` (видна только при valid непустом JQL), Popover с name input (предзаполнен `value.slice(0, 40)`) + `Save` (disabled при пустом name) / `Cancel`. 7 новых i18n ключей (en + ru).
- `GanttToolbar.test.tsx` — 27 тестов, включая toggle режима, validation matrix, save flow, **SC-18 (Cancel не сохраняет)** и Save-disabled-on-empty-name.
- `GanttToolbar.stories.tsx` — `WithJqlSearch`, `WithJqlSearchInvalid`, `WithSavePopoverOpen` (с `play`).
- `GanttChartContainer.tsx` — проброс `quickFilterSearchMode` + `onQuickFilterSearchModeChange` + `onSaveJqlAsQuickFilter`-handler (`crypto.randomUUID()` → append → clear search → reset mode → toggle активность).
- `requirements.md` — расширен FR-17 (два режима + Save-as-chip + acceptance × 4) + Changelog.
- `gantt-chart-quick-filters.feature` — **+7 сценариев** (`@SC-GANTT-QF-13..19`).
- `EPIC-1-gantt-chart.md` — Phase 7: добавлена строка TASK-44.

**Проблемы и решения**:

**Проблема 1 (REVIEW Warning):** в коде остался один хардкодженный `aria-label="Quick filter search mode"` на `<Segmented>`.
Решение: добавлен i18n ключ `quickFiltersModeAriaLabel` (en/ru), `aria-label={texts.quickFiltersModeAriaLabel}`.

**Проблема 2 (REVIEW REQUIREMENTS_GAP):** `requirements.md` упоминал `appendQuickFilterToScope(scopeKey, qf)`, реализован `appendQuickFilterToCurrentScope(qf)`.
Решение: реализованный API оставлен (он лучше — модель сама владеет `currentScope`); `requirements.md` синхронизирован с реализацией.

**Проблема 3 (REVIEW UX):** Save в popover был активен при пустом name; handler тихо игнорировал.
Решение: `disabled={saveNameDraft.trim() === ''}` + явный тест.

**Проблема 4 (REVIEW MISSED_SCENARIO в тестах):** SC-18 (Cancel) не имел прямого unit-теста.
Решение: добавлен тест `cancel button closes popover and does not call onSaveJqlAsQuickFilter (SC-GANTT-QF-18)`. Проверка визуального закрытия popover'а отдана в Storybook (JSDOM ненадёжен в animation cleanup антдизайна).

**Проблема 5 (QA TS error):** `[...base.quickFilters, qf]` падал, когда `base.quickFilters === undefined` (legacy stored settings).
Решение: `[...(base.quickFilters ?? []), qf]`.

**Проблема 6 (QA TS error):** `defaultProps` в `GanttToolbar.test.tsx` использовал `as const` (`'days'`, `'text'`), что ломало override на `'weeks'`/`'jql'` через `Partial<typeof defaultProps>`. Также `statusBreakdownAvailability` (preexisting, опциональный prop) был недоступен через override.
Решение: явная типизация `interval: 'days' as TimeInterval`, `quickFilterSearchMode: 'text' as QuickFilterSearchMode`, `renderToolbar(overrides: Partial<GanttToolbarProps>)`.

**Что осталось пользователю (ручная верификация)**:
- (опц.) Live-проверка на реальной Jira (TTP-23422 → Settings → ввод JQL в поиск → Save as chip).
- Перевод TASK-44 → DONE после ручной верификации.
- Опциональный commit + PR.
