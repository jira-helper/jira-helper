# Review: TASK-44 — Quick filters: JQL search mode + Save as chip

**Дата**: 2026-04-21
**TASK**: [TASK-44](./TASK-44-quick-filters-jql-search.md)
**Вердикт**: APPROVED (с тремя Warning, исправлены до QA)

## Findings

### Critical

Нет.

### Warning

1. **i18n** — `GanttToolbar.tsx`: хардкодженный `aria-label="Quick filter search mode"` на `<Segmented>` режима поиска. Все остальные строки в quick-filters row уже в `GANTT_TOOLBAR_TEXTS`.
   - Действие: вынести в `quickFiltersModeAriaLabel` (`Quick filter search mode` / `Режим поиска быстрых фильтров`).

2. **REQUIREMENTS_GAP** — `requirements.md` FR-17 (line 103) упоминает `GanttSettingsModel.appendQuickFilterToScope(scopeKey, qf)`, реализован `appendQuickFilterToCurrentScope(qf)`. Реализованный вариант лучше (модель уже владеет `currentScope`).
   - Действие: синхронизировать requirements.md с реализованным API.

3. **UX** — `GanttToolbar.tsx`: кнопка `Save` в popover активна даже при `saveNameDraft.trim() === ''`; `handleConfirmSaveJql` тихо игнорирует.
   - Действие: `disabled={!saveNameDraft.trim()}`.

4. **MISSED_SCENARIO в тестах** — SC-GANTT-QF-18 (Cancel не сохраняет) не имеет прямого unit-теста toolbar'а (только косвенно).
   - Действие: добавить тест "cancel button closes popover and does not call onSaveJqlAsQuickFilter".

### Nit

- Дублирование двух `<Input>` (error/non-error ветка) — можно унифицировать через условный `status`/`aria-invalid`.
- `useMemo` deps по `resolved` (геттер возвращает новый объект каждый рендер) — мемоизация фактически бесполезна, out of scope.
- `WithSavePopoverOpen` story использует `play` с `querySelector` вместо `@storybook/test`.
- Удаление `draftFromResolved` — out-of-scope cleanup, но оправдано.

## Архитектура

- ✅ Container/View разделение: `GanttToolbar` чистая View; бизнес-логика создания UUID, очистки search, переключения режима, активации chip — в `GanttChartContainer.handleSaveJqlAsQuickFilter`.
- ✅ State в моделях: `searchMode` живёт в `GanttQuickFiltersModel` (valtio).
- ✅ Команды у `model`, чтения у snapshot.
- ✅ `useMemo` deps включают `searchMode`.
- ✅ Graceful fallback на invalid JQL — единая семантика с `matchQuickFilter`.

## Тестовая стратегия

- ✅ AAA-паттерн.
- ✅ Изоляция через `beforeEach`.
- ✅ Edge-кейсы: invalid JQL, empty/whitespace, custom field by display name, AND-комбинации, append в empty/existing scope, persist в localStorage.

## BDD-сценарии — соответствие

| Сценарий | Покрытие |
|---|---|
| SC-13 toggle text↔jql + retain value | ✅ model test + toolbar test |
| SC-14 invalid JQL graceful + red border + tooltip | ✅ applyQuickFiltersToBars test + toolbar test (`aria-invalid`) |
| SC-15 Save flow: chip created, search cleared, mode→text, chip active | ✅ container handler + toolbar test + model test (persist localStorage) |
| SC-16 Save button hidden when empty/invalid | ✅ toolbar tests (matrix) |
| SC-17 mode reset on reload | ✅ интегрально (модель пересоздаётся через DI) |
| SC-18 Cancel does not persist | ⚠ только косвенно — добавим прямой тест |
| SC-19 Clear resets mode | ✅ model test + container wiring |

## Качество кода

- Naming, JSDoc, конвенции — OK.
- Нет утечек, нет eval/innerHTML.
- CQS: getters без side effects, setters явные.

## Резюме

Critical-проблем нет, blockers для merge нет. Перед QA применяются три Warning-фикса (aria-label i18n, requirements.md sync, Save disabled, Cancel-тест).
