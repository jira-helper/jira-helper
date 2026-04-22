# STATUS-RESUME — Gantt JQL search + post-launch UX feedback (handoff)

**Дата**: 2026-04-22
**Ветка**: `feat/gantt-chart-wip` (uncommitted, см. `git status`)
**Контекст**: продолжение работы по EPIC-1 (Gantt chart). Эта сессия закрыла TASK-44 (JQL search в quick filters), а также пять волн пост-релиз-фидбека от пользователя (P1–P5) и две косметические правки UI вокруг Issue Settings.

> Этот документ — точка входа для следующего агента. Здесь только то, что сделано в **последней** сессии. Историю предыдущих фиксов (Bug 1 Platform=Backend, Bug 2 layout shift, GanttSettingsModal UX polish) см. в [TASK-42](./TASK-42-jql-field-resolver-shared.md), [TASK-43](./TASK-43-settings-modal-layout-stability.md) и в EPIC-1 Phase 7.

---

## TL;DR (что сделано / что осталось)

✅ **Сделано в этой сессии**:
1. **TASK-44** — JQL-режим в gantt quick-filter search + «Save as quick filter» popover. Code review + QA + live verify пройдены.
2. **P1 (hotkeys)** — все input-поля внутри Gantt больше не триггерят jira-хоткеи (`stopJiraHotkeys` утилита).
3. **P2 (JQL parsing)** — токенайзер `simpleJqlParser` теперь понимает `project=TRPA AND status=Done` без пробелов вокруг `=`/`!=`/`~`/`!~`/`,`. Регрессия после reload устранена.
4. **P3 (issue link types)** — `computeBars` теперь действительно фильтрует по `settings.issueLinkTypesToInclude` (id + direction).
5. **P4 (status-history & missing-dates indicators)** — два жёлтых тега в `GanttToolbar` с tooltip-таблицей по проблемным задачам (Issue / Summary / Reason). Скрываются, когда проблем нет.
6. **P5 (i18n)** — все новые строки заведены в `TEXTS` и локализованы en/ru.
7. **Issue Settings button UX** — заменена «непонятная иконка» (`<div><img/></div>`) на нативную AUI-кнопку `[<logo 20px> Helper]` с tooltip и a11y-атрибутами, host исправлен с block-`<div>` на inline-`<span>` (раньше иконка съезжала на новую строку).
8. **LocalSettings tab in Issue Settings** — новый `LocalSettingsIssuePage` регистрирует таб «Local Settings» (язык auto/ru/en) в той же модалке Issue Settings, что и Gantt Chart.

⏭ **Осталось следующему агенту**:
1. (опц.) Создать **TASK-45** на пункты P1–P5 + Issue Settings UX и зафиксировать как DONE (по шаблону `.cursor/skills/task-template/SKILL.md`). Можно объединить в один TASK-45 «post-launch polish» — все правки маленькие и тематически связаны.
2. **TASK-44** — перевести в DONE в md-файле и в EPIC-1 Phase 7 (если ещё нет).
3. **TS-warnings** в `tsc --noEmit` — pre-existing, не от этой сессии (см. секцию «Что не трогать»).
4. Предложить пользователю commit + PR (детальный draft message — в конце документа).

---

## Что было сделано в этой сессии

### TASK-44 — Quick-filter search: text-mode + JQL-mode

**Спецификация**: [TASK-44-quick-filters-jql-search.md](./TASK-44-quick-filters-jql-search.md)

**UX**: слева от input — `Segmented [Text|JQL]`. В JQL-mode появляется live-валидация (красная рамка + текст ошибки) и кнопка «Save as quick filter» (доступна только при валидном непустом JQL). По клику — inline `Popover` с `Input` для имени, кнопки `Cancel` / `Save`. После сохранения чип добавляется в текущий scope, search сбрасывается, mode возвращается в `Text`, новый чип становится активным.

**Файлы**:
- `src/features/gantt-chart/IssuePage/components/GanttToolbar.tsx` — `Segmented`, popover, валидация, новые i18n-ключи (`quickFiltersModeText`, `quickFiltersModeJql`, `quickFiltersSaveAsFilter`, `quickFiltersSaveDialogName`, `quickFiltersJqlInvalid`, `quickFiltersModeAriaLabel` и др.).
- `src/features/gantt-chart/models/GanttQuickFiltersModel.ts` — session-state (`mode`, `text`, `jqlError`), методы `setMode`, `setText`.
- `src/features/gantt-chart/quickFilters/{matchQuickFilter,applyQuickFiltersToBars,builtIns}.ts` — bars-side фильтрация по тексту/JQL с graceful fallback на «show all» при невалидном JQL.
- `src/features/gantt-chart/models/GanttSettingsModel.ts` — `appendQuickFilterToCurrentScope(quickFilter)` (исправление `base.quickFilters ?? []` для type safety).
- Тесты: `GanttToolbar.test.tsx`, `GanttQuickFiltersModel.test.ts`, `quickFilters.test.ts`, `GanttSettingsContainer.test.tsx` (+ SC-GANTT-QF-18 cancel scenario).

**Code review** (gateway, должен пройти до QA): 4 находки (i18n hardcoded aria-label, `requirements.md` ↔ implementation несостыковка имени метода, save-button gating на пустое имя, отсутствующий unit-test для cancel-сценария). Все исправлены.

**QA**: `vitest run src/features/gantt-chart` — green; `eslint src/features/gantt-chart` — clean; `npm run build` — green; live verify в Jira (TTP-21739) — chip `Tasks only` создаётся, активен, `bars` уменьшается ожидаемо. Один блокер при verify (Gantt секция collapsed → input не visible) обходился кликом по collapse-header.

### P1 — Jira hotkeys interfere with input

**Симптом**: при печати в quick-filter search Jira ловила буквы как хоткеи (`a`, `c`, `i`, `m`, …), вызывая Assign / Comment / попапы.

**Корень**: Jira вешает hotkey-listener на `keydown`/`keyup` через native `addEventListener`. React synthetic `stopPropagation()` его не останавливает — нужен `stopImmediatePropagation()` на native event.

**Решение**: новая утилита.

```1:8:src/shared/dom/stopJiraHotkeys.ts
import type React from 'react';

export const stopJiraHotkeys = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
};
```

**Подключено**:
- `GanttToolbar.tsx` — на основном search input и на input внутри «Save as quick filter» popover.
- `GanttSettingsModal.tsx` — на корневом `<Form onKeyDownCapture={stopJiraHotkeys} onKeyUpCapture={stopJiraHotkeys}>` (одно место покрывает все вложенные input/textarea/select).
- Tests: `stopJiraHotkeys.test.ts` + регрессия в `GanttToolbar.test.tsx` («keystrokes do not bubble to window»).

**Live verify**: ввёл «kafka aa comment cc» в search, Jira хоткеи не сработали.

### P2 — Saved valid JQL highlighted as invalid after reload

**Симптом**: пресет `project=TRPA AND status=Done` после `location.reload()` показывался с ошибкой `Unknown operator: "AND". Did you forget to quote the field name?`. Если стереть и ввести руками — становилось OK.

**Корень**: `tokenize()` в `simpleJqlParser.ts` разделял по whitespace, поэтому `project=TRPA` и `status=Done` шли как **single-token** field names, а `AND` — как «оператор поля». Когда пользователь вводил руками, IDE/UI часто вставляла пробел вокруг `=` и тогда токенизация разбивалась корректно.

**Решение**: токенайзер переписан так, чтобы корректно отделять `=`, `!=`, `~`, `!~`, `,` независимо от окружающего пробела (как делает реальный Jira).

**Файлы**:
- `src/shared/jql/simpleJqlParser.ts` — переписана `tokenize()`.
- `src/shared/jql/simpleJqlParser.test.ts` — добавлены кейсы без пробелов.

**Live verify**: `issuetype=Task`, `project=TTP AND issuetype=Task` парсятся и фильтруют без ошибок и после reload.

### P3 — Issue link type filter not applied to bars

**Симптом**: в settings → Issues → Issue link types можно отметить какие типы включать, но selection ни на что не влиял.

**Корень**: `computeBars` пропускал issues с любыми `issueLink`-связями, не сверяясь с `settings.issueLinkTypesToInclude`.

**Решение**: добавлена `matchesLinkTypeFilter(issue, root, settings)` — сверяет `linkTypeId` и направление (`inward`/`outward`) против списка из настроек. Если список пуст — всё включено (соответствует UX «фильтр выключен»).

**Файлы**:
- `src/features/gantt-chart/utils/computeBars.ts` — функция + интеграция в основной loop по subtasks (только для `relation === 'issueLink'`).
- `src/features/gantt-chart/utils/computeBars.test.ts` — тесты на матч/не-матч/empty filter.

**Live verify**: включил `includeIssueLinks`, добавил фильтр `Blocks (outward)` — chart стал пуст (0 bars). Снял фильтр — вернулись 5 bars. Логика работает.

### P4 — «X/Y with history» block UX → two yellow tooltip-tags

**Из чего росло**: пользователь сказал, что tag «17/20 с историей» не несёт пользы и не привлекает внимания. На follow-up попросил для обоих кейсов («задачи без истории статусов» **и** «задачи не на графике») сделать одинаковый паттерн: жёлтый тег с warning-иконкой → hover → таблица с проблемными задачами и причинами (как в `MissingDatesSection`).

**Решение**:
- Тег `gantt-no-history-tag` показывается только если есть задачи без истории; формат `No history for X of Y tasks` (или `... 1 task`); tooltip — таблица **Issue / Summary** + объяснение, что бары этих задач окрашены по текущему статусу.
- Тег `gantt-missing-dates-tag` показывается только если `dataSnap.missingDateIssues.length > 0`; формат `X tasks not on chart` (или `1 task ...`); tooltip — таблица **Issue / Summary / Reason** (reason переиспользует `MISSING_DATES_REASON_TO_TEXT_KEY`).
- Оба тега — `cursor:help`, `tabIndex={0}`, `WarningOutlined` icon, расширенный `aria-label`.

**Файлы**:
- `src/features/gantt-chart/IssuePage/components/GanttToolbar.tsx` — оба тега, новые i18n-ключи (`statusBreakdownNoHistoryTag*`, `missingDatesTag*`, `*TooltipHeader/Description/ColIssue/ColSummary/ColReason/More`).
- `src/features/gantt-chart/IssuePage/components/GanttChartContainer.tsx` — новый memo `tasksWithoutStatusHistory` (фильтрует `visibleBars` где `statusSections.length <= 1`, мапит в `{key, summary}`); пробрасывает `missingDateIssues` и `tasksWithoutStatusHistory` в toolbar.
- `src/features/gantt-chart/IssuePage/components/MissingDatesSection.tsx` — экспорт `MISSING_DATES_TEXTS`, `MISSING_DATES_REASON_TO_TEXT_KEY` для переиспользования в toolbar.
- `GanttToolbar.test.tsx` — тесты для обоих тегов (singular/plural, focusable, tooltip content).
- `GanttToolbar.stories.tsx` — `WithPartialStatusHistory`, `WithMissingDateIssues`.

**Live verify**: на TTP-21739 у всех задач есть история — тег `gantt-no-history-tag` корректно скрыт. Воспроизвести «missing dates» через UI/localStorage не удалось (см. ниже «Известные не-блокеры»), но рендер-логика идентична уже верифицированному `gantt-no-history-tag`, и Storybook + unit-тесты её покрывают.

### P5 — i18n coverage

Все новые тексты этой сессии заведены в `TEXTS satisfies Texts<...>` и проходят через `useGetTextsByLocale`. Полный список ключей — в `GANTT_TOOLBAR_TEXTS` (`GanttToolbar.tsx`) и `ISSUE_SETTINGS_TEXTS` (`IssueSettingsComponent.tsx`).

> Намеренно **не делал** глубокий аудит **всех** существующих aria-label в кодовой базе — это вне scope текущей сессии. Если потребуется отдельный e2e-аудит i18n — это задача под отдельный TASK.

### Issue Settings button — visual redesign

**Симптом**: на скриншоте Jira issue view справа от `Share`/`Export`/`>>` стоял безымянный лого jira-helper в `<div>` — не выглядел как кнопка, был «непонятным» по словам пользователя. Дополнительно `<div>` — block-element, из-за чего иконка съезжала на следующую строку под тулбар.

**Решение** (после двух итераций):
1. Заменил `<div><img/></div>` на нативную AUI `<button class="aui-button">` — теперь у кнопки серый фон `rgba(9,30,66,0.08)`, корректные ховер/фокус, размер 30px (как у Share/Export).
2. Host в `IssueViewPageObject.insertToolbarButton` — `<div>` → `<span style="display:inline-flex; margin-left:5px">` (фиксит «съезжание»).
3. Контент кнопки прошёл итерацию: `[gear + 14px logo]` → `[gear + 14px logo (no subtle)]` → финал **`[20px logo + "Helper"]`**. Шестерёнка убрана как избыточная (вся кнопка == «открыть настройки»), `Helper` — короткий бренд-лейбл, одинаковый en/ru.

**A11y/UX**: `title` + `aria-label` = «jira-helper settings» / «Настройки jira-helper», `aria-haspopup="dialog"`, `aria-expanded={isOpen}`.

**Файлы**:
- `src/issue-settings/IssueSettingsComponent.tsx` — новая разметка кнопки + i18n (`buttonLabel`, `buttonText`).
- `src/features/gantt-chart/page-objects/IssueViewPageObject.ts` — host меняется на `<span>` с inline-flex.

**Live verify**: TTP-21739 — кнопка 91×30, в одном ряду с Share/Export, клик открывает модалку с табами Gantt Chart / Local Settings / Bars / Issues / Filters.

### LocalSettings tab в Issue Settings modal

**Запрос**: добавить переключение языка прямо из issue view, не уходя на board.

**Решение**: новый `LocalSettingsIssuePage` (по образцу `LocalSettingsBoardPage`) делает `registerIssueSettings({ title: 'Local Settings', component: LocalSettingsTab })`. Сама модалка остаётся owned by `GanttChartIssuePage` (он вставляет toolbar-кнопку); если в будущем Gantt будет condition-skip, модалка не появится — это OK по архитектуре «модалка живёт у фичи, которая её показывает».

**Файлы**:
- `src/features/local-settings/IssuePage.ts` — новый `PageModification` (waits for `#details-module`, calls `loadLocalSettings`, registers tab).
- `src/content.ts` — `import { LocalSettingsIssuePage, localSettingsIssuePageToken }`, `container.register(...)`, добавлен в массив `[Routes.ISSUE]`.

**Live verify**: TTP-21739 → Helper → таб «Local Settings» рядом с «Gantt Chart», внутри `data-testid="locale-select"` со значением «Auto».

---

## Состояние проверок

| Проверка | Команда | Статус |
|---|---|---|
| Unit-тесты gantt-chart | `npx vitest run src/features/gantt-chart` | ✅ all green (включая новые тесты на toolbar tags, quick filters JQL, computeBars link-types) |
| Unit-тесты shared/jql | `npx vitest run src/shared/jql` | ✅ green (включая регрессию на JQL без пробелов) |
| Unit-тесты shared/dom | `npx vitest run src/shared/dom` | ✅ green (`stopJiraHotkeys`) |
| Unit-тесты IssueViewPageObject | `npx vitest run src/features/gantt-chart/page-objects` | ✅ 18/18 (host теперь span — тесты не проверяют тип, продолжают проходить) |
| ESLint (затронутое) | `npx eslint src/features/gantt-chart src/issue-settings src/shared/dom src/shared/jql src/features/local-settings src/content.ts` | ✅ Clean |
| TypeScript (всё) | `npx tsc --noEmit` | ⚠️ Pre-existing ошибки в `BoardPage`, mock services, `GanttDataModel.test.ts` — **НЕ от этой сессии**, см. ниже |
| Production build | `npm run build` | ✅ `built in ~5s`, `dist/assets/content.ts-*.js` ~3.7 MB / ~795 kB gzip |
| Live Jira (P1 hotkeys) | TTP-21739, печать «kafka aa comment cc» в search | ✅ хоткеи не сработали |
| Live Jira (P2 JQL) | TTP-21739, JQL `issuetype=Task`, `project=TTP AND issuetype=Task` | ✅ парсятся, фильтруют, не теряются после reload |
| Live Jira (P3 link types) | TTP-21739, фильтр `Blocks (outward)` | ✅ chart filter работает (5 → 0 → 5 bars) |
| Live Jira (P4 no-history tag) | TTP-21739 (все задачи с историей) | ✅ тег скрыт, как и должен |
| Live Jira (P4 missing-dates tag) | TTP-21739 + попытки воспроизвести | ⚠️ см. «Известные не-блокеры»; рендер-логика верифицирована Storybook + unit-тестами |
| Live Jira (Issue Settings button) | TTP-21739 | ✅ 91×30, ховер серый, клик открывает модалку |
| Live Jira (LocalSettings tab) | TTP-21739 → Helper | ✅ таб «Local Settings», селект `Auto/Russian/English` |

---

## Известные не-блокеры

1. **Воспроизведение `missing dates` на live Jira не удалось**. Прямые попытки через UI exclusion filters и через `localStorage.jh-gantt-settings.storage.TTP.exclusionFilters` не наполняли `dataSnap.missingDateIssues`. Возможно, отдельный баг в потоке exclusion → missingDateIssues, или мои exclusion-фильтры не матчились по схеме. **НЕ блокер для тега**: рендер-логика идентична уже работающему `gantt-no-history-tag`, и Storybook + unit-тесты её покрывают. Если это реально баг — отдельный TASK.
2. **Pre-existing TS-ошибки** в `tsc --noEmit`:
   - `src/features/gantt-chart/IssuePage/GanttChartIssuePage.ts(117,11)` — `WithDi children: ReactNode` (артефакт React 18 типов).
   - `src/features/gantt-chart/models/GanttDataModel.test.ts` — mock без `getStatuses`, `IssueLinkType`/`Issue` неполные.
   - `src/features/sub-tasks-progress/BoardSettings/*.stories.tsx` — те же mock-проблемы.
   - `src/page-objects/BoardPage/*` — отсутствующие модули `getNameFromTooltip`, `IBoardPagePageObject`, `JiraEnvToken`.
   - `src/shared/jira/stores/jiraStatusesStore.ts` — отсутствующий `'../types'`.
   - **Это всё — наследие предыдущих миграций, не от этой сессии.** Не трогать в этом тикле, иначе perepulayet source maps. Зафиксировать отдельной TASK или взять в технический долг.
3. **Внешние Jira/Allure 401/404** в console — внешние проблемы, игнорировать.

---

## Что не трогать (чужие проблемы)

- Pre-existing TS-ошибки выше — не вводи их в этот тикл.
- Pre-existing test failures за пределами `src/features/gantt-chart`, `src/shared/jql`, `src/shared/dom`, `src/issue-settings`, `src/features/local-settings`, `src/infrastructure/jira/fields` — игнорировать.
- `src/page-objects/BoardPage/module.ts`, `src/issue-settings/issueSettingsModel.ts` — у меня были модификации только на уровне регистрации (Routes.ISSUE), не реструктуризация модели.

---

## Команда «one-liner» для смоук-проверки после rebase

```bash
npx eslint src/features/gantt-chart src/shared/jql src/shared/dom src/issue-settings src/features/local-settings src/content.ts \
  && npx vitest run src/features/gantt-chart src/shared/jql src/shared/dom \
  && npm run build
```

Ожидаемо: все тесты PASS, lint чистый, build успешный (~5 сек).

---

## Live-verify recipe (extension-testing skill)

Полный workflow: [`.cursor/skills/extension-testing/SKILL.md`](../../../.cursor/skills/extension-testing/SKILL.md). Кратко:

```bash
npm run build
playwright-cli -s=jh close
playwright-cli -s=jh open https://jira.tcsbank.ru/browse/TTP-21739 --headed
sleep 5
# что есть в DOM
playwright-cli -s=jh eval "() => [...document.querySelectorAll('[data-jh-section], [data-jh-component]')].map(e => e.getAttribute('data-jh-component') || e.getAttribute('data-jh-section'))"
# ошибки
playwright-cli -s=jh console error
```

Самые ценные эвалы для regression-проверки этой сессии:

```js
// (P3) link types работают?
() => Array.from(document.querySelectorAll('[data-testid="gantt-bar"], [data-testid="gantt-bar-open-ended"]')).length

// (P4) теги видны?
() => ({
  noHistoryTag: !!document.querySelector('[data-testid="gantt-no-history-tag"]'),
  missingDatesTag: !!document.querySelector('[data-testid="gantt-missing-dates-tag"]'),
})

// (Settings button) кнопка отрендерена корректно?
() => {
  const b = document.querySelector('[data-jh-component="issueSettingsButton"]');
  return b && { tag: b.tagName, cls: b.className, text: b.textContent.trim() };
}

// (LocalSettings tab) таб появился?
() => [...document.querySelectorAll('.ant-tabs-tab')].map(t => t.textContent.trim())
```

---

## Когда все проверки пройдены — что делать дальше

1. (опц.) Создать **TASK-45** «Post-launch polish: hotkeys, JQL parsing, link-type filter, indicator tags, Issue Settings UX». Status: DONE. Описание — этот документ. Использовать `.cursor/skills/task-template/SKILL.md`.
2. **TASK-44** перевести в DONE в md-файле и в EPIC-1 (если ещё нет).
3. Предложить пользователю commit:

```text
Готово. Сделано в сессии:
  1. TASK-44 — JQL search в Gantt quick filters (text/jql segmented + save-as-quick-filter popover)
  2. P1 — stopJiraHotkeys: Jira больше не ловит хоткеи внутри Gantt input'ов
  3. P2 — simpleJqlParser: токенайзер понимает операторы без пробелов
  4. P3 — computeBars: реальная фильтрация по issue link types
  5. P4 — два жёлтых tooltip-тега в toolbar (no-history / missing-dates)
  6. P5 — i18n всех новых строк
  7. Issue Settings button: AUI-button с лого + "Helper" вместо «непонятной» иконки
  8. LocalSettings tab в Issue Settings modal (переключение языка из issue view)

Предлагаю commit:
  feat(gantt-chart): JQL mode for quick-filter search + save-as-quick-filter
  fix(gantt-chart): JQL parser handles operators without whitespace
  fix(gantt-chart): apply issue-link-type filter in computeBars
  feat(gantt-chart): yellow indicator tags for no-history and missing-dates with detail tooltips
  fix(extension): prevent Jira hotkeys from firing inside extension input fields
  feat(issue-settings): redesign toolbar button as native AUI button + add LocalSettings tab

и открыть PR в feat/gantt-chart-wip → main?
```

4. Не пушить и не коммитить без явного подтверждения пользователя.

---

## Полезные ссылки на артефакты этой сессии

**Новые файлы**:
- `src/shared/dom/stopJiraHotkeys.ts` (+`.test.ts`)
- `src/features/gantt-chart/quickFilters/{matchQuickFilter,applyQuickFiltersToBars,builtIns}.ts` (+`quickFilters.test.ts`)
- `src/features/gantt-chart/models/GanttQuickFiltersModel.ts` (+`.test.ts`)
- `src/features/local-settings/IssuePage.ts`
- `src/infrastructure/jira/fields/getFieldValueForJql.ts` (+`.test.ts`) — *появился в предыдущей сессии, в этой не менялся*
- `.agents/tasks/gantt-chart/TASK-44-quick-filters-jql-search.md`
- `.agents/tasks/gantt-chart/TASK-42-jql-field-resolver-shared.md` (предыдущая сессия)
- `.agents/tasks/gantt-chart/TASK-43-settings-modal-layout-stability.md` (предыдущая сессия)
- `.agents/tasks/gantt-chart/gantt-chart-quick-filters.feature` (BDD для TASK-44)

**Главные изменённые**:
- `src/features/gantt-chart/IssuePage/components/GanttToolbar.tsx` — quick filter UX, теги, hotkeys.
- `src/features/gantt-chart/IssuePage/components/GanttChartContainer.tsx` — `tasksWithoutStatusHistory` memo, проброс `missingDateIssues`.
- `src/features/gantt-chart/IssuePage/components/GanttSettingsModal.tsx` — `stopJiraHotkeys` на корневом Form.
- `src/features/gantt-chart/IssuePage/components/MissingDatesSection.tsx` — экспорт текстов и reason-mapping.
- `src/features/gantt-chart/utils/computeBars.ts` — `matchesLinkTypeFilter`.
- `src/features/gantt-chart/models/GanttSettingsModel.ts` — `appendQuickFilterToCurrentScope`.
- `src/shared/jql/simpleJqlParser.ts` — токенайзер без пробелов.
- `src/issue-settings/IssueSettingsComponent.tsx` — AUI-кнопка + LocalSettings i18n.
- `src/features/gantt-chart/page-objects/IssueViewPageObject.ts` — host `<div>` → `<span>`.
- `src/content.ts` — регистрация `localSettingsIssuePageToken` в `Routes.ISSUE`.

**Тесты, доработанные под новые фичи**:
- `GanttToolbar.test.tsx` (теги, hotkeys, JQL save popover)
- `GanttChartContainer.test.tsx` (`tasksWithoutStatusHistory`, проброс `missingDateIssues`, hotkeys regression)
- `GanttSettingsContainer.test.tsx` (cancel-сценарий SC-GANTT-QF-18)
- `computeBars.test.ts` (link-type filter)
- `simpleJqlParser.test.ts` (операторы без пробелов)

**Stories**:
- `GanttToolbar.stories.tsx` — `WithPartialStatusHistory`, `WithMissingDateIssues`.
- `GanttSettingsModal.stories.tsx` — `WithJqlValidationError` (предыдущая сессия).

**Live-verify скриншоты**: `.playwright/output/` (платежная история по timestamp; не критичные, можно не коммитить).
