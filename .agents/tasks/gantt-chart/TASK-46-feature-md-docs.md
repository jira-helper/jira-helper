# TASK-46: feature.md для gantt-chart (user-facing docs)

**Status**: DONE
**Type**: other (docs)

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Создать `src/features/gantt-chart/feature.md` — пользовательскую документацию фичи Gantt Chart по аналогии с другими `feature.md` в `src/features/*/feature.md`. Документ должен описывать **что делает фича, как настроить и как себя ведёт** на странице, без деталей реализации, без типов, без архитектуры.

Референсы стиля:
- `src/features/sub-tasks-progress/feature.md` — наиболее похож по сложности (board-side, scope-settings, conditions).
- `src/features/local-settings/feature.md` — короткий и лаконичный (UI-фича внутри issue settings).
- `src/features/issue/feature.md` — issue-view фича без настроек.
- `src/features/charts/feature.md` — chart-фича с настройками.

## Файлы

```
src/features/gantt-chart/
└── feature.md   # новый
```

## Что сделать

1. Создать `src/features/gantt-chart/feature.md` со следующей структурой (соответствует существующим `feature.md`):
   - **# Заголовок** (например, `# Gantt chart on issue view`).
   - Лид-параграф (1–2 предложения): что фича даёт пользователю.
   - **## What it does** — буллеты, без технических терминов; описать:
     - Где появляется (issue view, sec ция «Jira Helper Gantt»).
     - Что показывает (bars per linked issue: subtasks, epic children, issue links).
     - Start/end mapping — приоритетный список из date-полей и status-переходов; что без настройки бар не считается.
     - Status breakdown toggle (multi-color sections per current status / changelog).
     - Колоринг по правилам (Bar colors).
     - Задачи без end → до «сегодня» с warning; задачи без start и end → отдельная сворачиваемая секция.
     - Quick filters (text/JQL search, built-in chips, custom chips, save-as-quick-filter).
     - Каскадные настройки: Global / This project / This project + issue type, copy from.
     - Жёлтые индикаторы: `No history for X of Y tasks`, `X tasks not on chart` (с tooltip).
     - Hover tooltip с настраиваемыми полями.
     - Zoom (wheel, +/-, dropdown intervals hours/days/weeks/months) + pan (drag, scrollbars).
     - Open in modal (полноэкранный режим).
   - **## How to set up** — нумерованный список 5–8 шагов; описать оба входа в настройки (toolbar gear + Issue Settings → Gantt Chart tab), как переключить scope, как настроить start/end mapping, exclusion filters, color rules, quick filters.
   - **## Behavior on the page** — как ведёт себя на issue view (collapsible-секция, поведение при изменении настроек, что переживает reload — пресеты — а что нет — активные chips, search mode).
2. Длина — примерно 30–60 строк (как `sub-tasks-progress/feature.md`). Не повторять `requirements.md` дословно — это user-facing документ, а не спецификация.
3. Язык — **английский**, тон — `feature.md` других фич (instructional, present tense, без emoji).
4. Markdown без кодовых блоков и без скриншотов. Только заголовки, списки, выделения курсивом/жирным где это естественно.

## Критерии приёмки

- [ ] Создан `src/features/gantt-chart/feature.md`.
- [ ] Структура: заголовок + лид + `## What it does` + `## How to set up` + `## Behavior on the page`.
- [ ] Тон и стиль соответствуют `src/features/sub-tasks-progress/feature.md`.
- [ ] Документ описывает all-significant функции из `requirements.md` (FR-1..18) на языке пользователя без технических терминов (`changelog`, `JQL`, `localStorage` упоминать можно — они часть UX).
- [ ] Без emoji, без TODO-блоков, без секций «Architecture»/«Files».
- [ ] Файл не превышает ~80 строк.

## Зависимости

- Источник истины — [requirements.md](./requirements.md) (FR-1..FR-18) и [STATUS-RESUME.md](./STATUS-RESUME.md) (как описать indicator tags / quick-filter JQL save).
- Стиль — `src/features/sub-tasks-progress/feature.md`, `src/features/local-settings/feature.md`, `src/features/issue/feature.md`, `src/features/charts/feature.md`.

---

## Результаты

**Дата**: 2026-04-22
**Агент**: generalPurpose
**Статус**: VERIFICATION

**Что сделано**:
- Создан `src/features/gantt-chart/feature.md` (39 строк, в пределах 30–60).
- Структура — заголовок + лид + `## What it does` + `## How to set up` + `## Behavior on the page`, как у `sub-tasks-progress/feature.md`.
- Покрыты FR-1..FR-17 из `requirements.md` и пост-релиз правки из `STATUS-RESUME.md` (P1, P4, Issue Settings → Helper button + Gantt Chart tab, JQL search + Save as quick filter).
- FR-18 (`getFieldValueForJql`) намеренно скрыт как implementation detail — пользователь видит его только через формулировку «match by field value or by a JQL expression».
- Тон, формат markdown и стиль соответствуют референсам (`sub-tasks-progress/feature.md`, `local-settings/feature.md`, `issue/feature.md`, `charts/feature.md`).

**Проблемы и решения**: нет (Change Control маркеров не было).
