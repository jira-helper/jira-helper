# Requirements: Gantt-диаграмма по сабтаскам задачи

**Feature folder**: `.agents/tasks/gantt-chart/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-04-11
**Статус**: agreed
**Has UI**: yes

## 1. Цель и мотивация

Предоставить пользователю визуальный обзор временных рамок работ по всем связанным задачам (сабтаски, эпик-линки, линкованные задачи) в виде Gantt-диаграммы прямо на странице просмотра задачи (issue view).

Сейчас в Jira (classic Server/DC) нет встроенного способа увидеть временную картину по дочерним задачам — пользователь вынужден открывать каждую задачу отдельно и мысленно составлять timeline. Gantt-диаграмма решает эту проблему, давая единый наглядный вид «кто когда работает» с возможностью настройки под конкретный workflow.

Это **новая фича**, расширяющая jira-helper на ранее не затронутую страницу — issue view.

## 2. Пользователи и контекст

- **Роли / контекст использования**: Любой пользователь, просматривающий задачу с дочерними задачами (менеджер, тимлид, разработчик). Основной сценарий — оценка прогресса и временных пересечений по эпику или задаче с сабтасками.
- **Страницы Jira и точки входа**:
  - Страница: **Issue View** (classic) — route `/browse/*`, определяется в `RoutingService.ts`.
  - Размещение: **после `#attachmentmodule`** в основном потоке issue view. `IssueViewPageObject.addSectionInMainFlow()` создаёт collapsible-секцию (по умолчанию контент свёрнут, разворачивается по клику).
  - **Точка входа в настройки (основная)**: кнопка jira-helper в `.aui-toolbar2-secondary` (последний child). По клику открывается **Issue Settings** — модалка с табами (аналогично `BoardSettingsComponent`). Одна модалка для всех фич на issue view. Gantt — первый таб. Паттерн: `registerIssueSettings({ title, component })` → Zustand store → `IssueSettingsComponent`.
  - **Точка входа в настройки (дублирующая)**: кнопка gear в тулбаре Gantt-диаграммы. Открывает **прямую** модалку настроек Gantt (без табов, использует тот же `GanttSettingsContainer`).

## 3. Функциональные требования

1. **FR-1: Загрузка связанных задач.** При открытии issue view загружать все связанные задачи через `JiraService.fetchSubtasks` (прямые сабтаски, эпик-линки, linked issues) с `expand: ['changelog']` для получения истории переходов статусов.
2. **FR-2: Отображение Gantt-диаграммы.** Рендерить горизонтальную Gantt-диаграмму с колбасками (bars) для каждой связанной задачи. Ось X — время (даты). Ось Y — список задач. Технология: React + SVG + d3-scale (time axis) + d3-zoom (zoom/pan).
3. **FR-3: Настройка старта и конца колбаски (priority list).** Пользователь задаёт **упорядоченный список источников** для **start** и для **end** работ. Каждый элемент списка — один из:
   - **Date field** — поле с датой у задачи (например, `Created`, `Due date`, `customfield_10010`).
   - **Status transition** — переход в указанный статус из changelog (например, «вошла в In Progress» — start, «вошла в Done» — end).
   
   **Семантика fallback (priority order):** для каждой задачи по очереди вычисляется дата от первого источника списка; если он не дал валидную дату (поле пустое или нужный переход не встречался в changelog) — пробуем следующий, и так до конца. Первый источник, давший дату, выигрывает. Если ни один не сработал — задача попадает в «issues not shown» (FR-9).
   
   **UI:** в модалке настроек секции «Start of bar» и «End of bar» содержат вертикальный список строк (один элемент = одно правило). Каждая строка — два селекта (тип источника + конкретное значение) и кнопки «↑», «↓», «✕». Кнопка «+ Add fallback» добавляет новую строку в конец списка. Список не может быть пустым (последнюю строку нельзя удалить).
   
   **Default при первом открытии — пустые списки настроек на уровне scope.** Пользователь должен сам настроить хотя бы одно правило start и одно правило end перед использованием. До настройки показываем сообщение «Настройте параметры диаграммы».
   
   **Хранение:** `startMappings: DateMapping[]` и `endMappings: DateMapping[]` в `GanttScopeSettings`. Миграция со старого формата (`startMapping` / `endMapping` в один объект) — автоматическая в `parseStoredPayload`: одиночный объект превращается в список из одного элемента.
4. **FR-4: Разбивка по статусам.** Toggle-переключатель: по умолчанию — простые однотонные колбаски; при включении — колбаска разбивается на секции по фактической истории статусов (`issue.changelog`), каждая секция окрашена в **цвет категории статуса** (аналогично прогресс-барам в sub-tasks-progress): `done` → green, `inProgress` → blue, `todo` → gray, `blocked` → red. Маппинг `statusCategory` → цвет через существующую схему `jiraColorScheme` из `src/features/sub-tasks-progress/colorSchemas.ts`.
   
   **Источник секций:** `parseChangelog(issue.changelog)` → `computeStatusSections(transitions, barStart, barEnd)`. Если у задачи нет changelog или нет ни одного перехода в окне `[barStart, barEnd]`, отображается одна секция, представляющая текущий статус задачи.
   
   **Fallback категории для Jira Server:** changelog Jira Server часто **не передаёт** `fromStatusCategory` / `toStatusCategory`. В этом случае `parseChangelog` возвращает транзиции с пустой категорией, и без дополнительной информации все секции окрашиваются в дефолтный «todo» (серый). Чтобы избежать этого, `computeBars` строит `Map<statusName, BarStatusCategory>` из текущих статусов всех загруженных задач (через `resolveStatusCategory`) и передаёт её в `computeStatusSections`. Резолвер секций при пустой категории смотрит на имя статуса в этой карте — так удаётся восстановить категорию для всех статусов, в которых **сейчас находится хотя бы одна задача в наборе**. Статусы, отсутствующие в карте, остаются `todo` (известное ограничение).
5. **FR-5: Включение задач по типу связи.** Пользователь настраивает, какие категории связанных задач включать в Гант (аналогично sub-tasks-progress):
   - **Direct subtasks** (boolean) — прямые подзадачи (`parent = issueId`).
   - **Epic children** (boolean) — задачи по `"Epic Link" = issueId`.
   - **Issue links** (boolean) — задачи из `linkedIssues(issueId)`. Если включено — дополнительный выбор конкретных link types с направлением (inward/outward). Пустой список = все link types.
   
   Загрузка данных — broad (`JiraService.fetchSubtasks` загружает всё одним JQL), фильтрация по включённым типам — **client-side в `computeBars`**. Каждая загруженная задача должна быть классифицирована по типу связи (subtask / epic child / issue link) и отфильтрована согласно `includeSubtasks`, `includeEpicChildren`, `includeIssueLinks` настройкам. Для определения типа связи:
   - **Subtask**: `issue.fields.parent` совпадает с root issue.
   - **Epic child**: `issue.fields["Epic Link"]` или кастомное поле (epic link) совпадает с root issue key.
   - **Issue link**: задача не является ни subtask, ни epic child — значит попала через `linkedIssues()`.
   
   Типы: `IssueLinkTypeSelection { id: string; direction: 'inward' | 'outward' }` — переиспользуется из `src/features/sub-tasks-progress/types.ts`.
6. **FR-6: Исключение задач.** Дополнительно к FR-5, пользователь может настроить **несколько** фильтров исключения через `IssueSelectorByAttributes` (режимы `field` и `jql`). Фильтры объединяются логикой **OR** — задача исключается, если соответствует **хотя бы одному** фильтру. Каждый фильтр применяется поверх включённых задач из FR-5. **Режим JQL** использует `parseJql` из `src/shared/jql/simpleJqlParser.ts` для client-side матчинга по полям задачи через общий резолвер `getFieldValueForJql(issue, fields)` из `src/infrastructure/jira/fields/getFieldValueForJql.ts` — см. **FR-18**. UI: секция «Exclusion filters» с кнопками добавления/удаления фильтров (аналогично color rules). Тултип объясняет логику OR.

   *Скрытие завершённых задач* перенесено из FR-6 в FR-17 (built-in quick filter «Hide completed»).
7. **FR-7: Фиксированный label на колбаске.** На каждой колбаске отображается `Key: Summary` (например, `PROJ-101: Auth service`). Если текст не помещается в ширину колбаски — обрезается с `…`. Полный текст всегда доступен в тултипе (FR-8).
8. **FR-8: Hover-подробности.** При наведении на колбаску отображается тултип с дополнительной информацией. Тултип **всегда** содержит полный `Key: Summary` (без обрезки). Дополнительный набор полей для тултипа — настраиваемый пользователем.
16. **FR-16: Раскраска колбасок по условию.** Пользователь может задать **правила раскраски** (color rules) колбасок. Каждое правило задаёт:
    - **Условие**: через `IssueSelector` (режим `field` — значение поля, или режим `jql` — JQL-выражение). **Режим JQL** использует `parseJql` из `src/shared/jql/simpleJqlParser.ts` + общий резолвер полей `getFieldValueForJql` (см. **FR-18**) — это даёт корректный матчинг по custom fields по их display name (например `Platform = Backend`), а не только по техническим `customfield_NNNNN`.
    - **Цвет**: выбор через antd `ColorPicker` (произвольный цвет). Значение хранится как hex-строка.
    
    Правила применяются **сверху вниз** — первое совпавшее правило определяет цвет колбаски. Задачи, не подпавшие ни под одно правило, отображаются цветом по умолчанию (серый/синий).
    
    Правила хранятся в scope-настройках (`GanttScopeSettings.colorRules`). UI: в модалке настроек — секция «Bar colors» с возможностью добавления/удаления/переупорядочивания правил.
9. **FR-9: Обработка задач без дат.**
   - Есть start, нет end → колбаска рисуется до «сегодня» + иконка warning на правом конце.
   - Нет ни start, ни end → задача не отображается на диаграмме, вместо этого под Гантом показывается сворачиваемая секция «N задач не отображены» с причинами для каждой задачи.
10. **FR-10: Каскадные настройки.** Настройки хранятся в `localStorage` с тремя уровнями специфичности (most specific wins):
   - **Global** (`_global`) — настройки по умолчанию для всех проектов.
   - **Project** (`PROJECT-KEY`) — переопределение для конкретного проекта.
   - **Project + IssueType** (`PROJECT-KEY:Story`) — переопределение для проекта и типа задачи.
   
   Разрешение при открытии задачи `PROJECT-A / Story`:
   1. Есть настройки для `PROJECT-A:Story`? → используем их.
   2. Иначе: есть для `PROJECT-A`? → используем их.
   3. Иначе: используем `_global`.
   
   По умолчанию пользователь настраивает global. В модалке настроек — scope selector (segmented: `Global` / `This project` / `This project + issue type`), показывающий какой scope сейчас активен. При создании нового scope — кнопка «Copy from...» для копирования настроек из существующей конфигурации.
   
   **Предпочтённый уровень scope (`preferredScopeLevel`)** сохраняется в `localStorage` вместе с настройками и восстанавливается при следующем открытии страницы. Если пользователь выбрал `projectIssueType`, при следующем открытии scope устанавливается с этим уровнем (при условии, что issue type определён из DOM). При **инициализации страницы** scope seedится через `effectiveScopeLevel ?? preferredScopeLevel` — то есть приоритет у того уровня, на котором реально лежат настройки (см. ниже про *effective scope*).
   
   **Effective scope (UI rule):** при **открытии модалки/таба настроек** scope автоматически снапается к тому уровню, чьи настройки сейчас фактически применяются к диаграмме (`effectiveScopeLevelForCurrentScope`). Алгоритм: если у текущего `currentScope` нет прямых настроек (`directSettings === null`) и есть более общий уровень с прямыми настройками, scope опускается до него. Это решает баг «модалка показывает Project + IssueType, а применяются Project». Реализация — `GanttSettingsModel.syncScopeToEffectiveAndOpenDraft()`, вызывается из `GanttSettingsContainer` и `GanttSettingsTab` на open/visibility change. Пользователь по-прежнему может вручную переключиться на любой уровень и настроить его «с нуля» (создаст новые прямые настройки при Save).
11. **FR-11: Модалка настроек.** Все настройки управляются из единой модалки, открываемой по кнопке gear рядом с диаграммой.
12. **FR-12: Zoom.** Пользователь может менять масштаб диаграммы:
    - Wheel zoom (Ctrl+scroll или pinch на trackpad) — плавный zoom.
    - Кнопки +/- для дискретного zoom.
    - Dropdown выбора интервала: hours / days / weeks / months — переключение фиксированного масштаба оси времени. При первой загрузке интервал выбирается **автоматически** на основе общего диапазона дат всех баров (< 2 дней → hours, 2 дня – 6 недель → days, 6 недель – 6 месяцев → weeks, > 6 месяцев → months). После ручного выбора пользователем авто-подбор не перезаписывает выбор.
13. **FR-13: Pan (перемещение).** Пользователь может перемещаться по диаграмме:
    - Drag в любом месте диаграммы (зажать и тянуть, как в Miro).
    - Scrollbars (горизонтальный и вертикальный) для привычной навигации.
14. **FR-14: Toolbar диаграммы.** Над диаграммой — тулбар с элементами управления: кнопки zoom +/-, dropdown интервала, кнопка gear (настройки), toggle разбивки по статусам, кнопка «Открыть в модалке». Под основным рядом — отдельный ряд **quick filters** (FR-17): live search + chips + clear all.
15. **FR-15: Полноэкранная модалка.** Кнопка «Open in modal» / «Открыть в модалке» в тулбаре. При нажатии Gantt-диаграмма открывается в полноэкранной модалке (100vw × 100vh, без отступов). Модалка содержит тот же toolbar + chart + missing dates section. Закрывается крестиком или Escape. Состояние зума/пана сохраняется при открытии/закрытии.
17. **FR-17: Quick filters в тулбаре.** Над диаграммой, отдельным рядом всегда виден блок quick filters — лёгкий способ ad-hoc сужения видимых задач без пересохранения настроек. Состоит из:
    - **Live search** (input с переключателем режима) — два режима поиска:
      - **Text** (default) — поиск по подстроке `KEY: Summary` (case-insensitive). Фильтрует видимые бары мгновенно. Placeholder: `Search by key or summary`.
      - **JQL** — выражение парсится через `parseJql` из `src/shared/jql/simpleJqlParser.ts`, матчинг по полям задачи через общий резолвер `getFieldValueForJql(issue, fields)` (см. **FR-18**). Placeholder: `e.g. assignee = currentUser() AND priority = High`. Live-валидация: при синтаксической ошибке поле подсвечивается красной рамкой и tooltip-ом с текстом ошибки парсера. **Невалидный JQL — graceful fallback**: пропускает все задачи (диаграмма не пустеет от опечатки), идентично поведению JQL-пресетов. Пустой/whitespace-only JQL также не фильтрует ничего.

      Режим переключается через `<Segmented>` контрол `[Text|JQL]` слева от input. Значение `searchQuery` **общее** для обоих режимов (при переключении не сбрасывается — пользователь может «поднять» текст в JQL-режим и наоборот). Сам режим — **session-only** (как и `searchQuery`), сбрасывается на reload в `text`.
    - **Save as quick filter** (`Save` button) — появляется **только в JQL-режиме**, когда `searchQuery` непустой и валидный (parseJql не упал). По клику открывается inline-popover с input-ом для name (предзаполнен первыми ~40 символами JQL) и кнопками `Save` / `Cancel`. Кнопка `Save` в popover дополнительно `disabled` при пустом `name.trim()`. По Save: создаётся `QuickFilter` (`id = crypto.randomUUID()`, `selector = { mode: 'jql', jql: <current> }`, `name = <input>`) и добавляется в `quickFilters` **текущего выбранного scope** (через `GanttSettingsModel.appendQuickFilterToCurrentScope(qf)` — scope берётся из `currentScope` модели, что гарантирует консистентность с тем уровнем, на котором пользователь сейчас работает); затем search input очищается, режим возвращается в `text`, новый chip автоматически активируется (визуально результат фильтрации не меняется). По Cancel: popover закрывается, ничего не сохраняется. Если scope ещё не имеет direct settings — они создаются (cascade base).
    - **Chips** (`Tag.CheckableTag`) — список пресетов в фиксированном порядке: сначала **built-in**, затем кастомные пользовательские пресеты в порядке `quickFilters` из настроек. Built-in:
      - `builtin:unresolved` — JQL `resolution is EMPTY` (всегда виден, не редактируется).
      - `builtin:hideCompleted` — задачи с `statusCategory != done` (специальный matcher, JQL не используется из-за вложенного поля). Заменяет старый чекбокс `hideCompletedTasks`.
    - **Clear all** — кнопка сбрасывает поиск (и режим в `text`) и активные chips. Появляется только когда есть активные фильтры или непустой поиск.
    - **Hidden count hint** — справа от chips, текст вида `4 hidden by quick filters`, появляется если хотя бы одна задача скрыта quick filters/search.

    **Семантика:** активные quick filters (включая search в любом режиме) объединяются логикой **AND** — задача показывается, если проходит каждый активный фильтр и подходит под search. Это соответствует поведению Jira boards. Применяется **поверх** FR-5/FR-6 — квик-фильтры работают со списком уже включённых задач. Quick filters **не** влияют на missing dates section (она строится по той же выборке, что и бары).

    **Custom presets** — пользователь может добавлять собственные пресеты в модалке настроек. Каждый пресет:
    - `id: string` (UUID, генерится через `crypto.randomUUID`).
    - `name: string` (label на chip).
    - `selector` — `{ mode: 'field', fieldId, value }` или `{ mode: 'jql', jql }` (живая валидация JQL через `parseJql` с подсветкой ошибок).

    Резолв полей в обоих режимах идёт через общий хелпер `getFieldValueForJql(issue, fields)` (см. **FR-18**) — это значит, что quick filter `Platform = Backend` корректно работает с custom field, у которого настоящий id `customfield_NNNNN`, а не только с системными полями.

    **Хранение:** custom presets живут в `GanttScopeSettings.quickFilters` и каскадируются (FR-10). **Активное состояние** chips и значение search — **session-only** (`GanttQuickFiltersModel`, valtio proxy), не сохраняются между перезагрузками страницы. Это сознательный trade-off: пресеты персистентны, активность — нет (зеркалит Jira boards).

    **UI настроек:** секция «Quick filters» в `GanttSettingsModal`, рядом с «Exclusion filters». Built-in пресеты в этой секции **не редактируются** (они в коде); пользователь видит только список своих кастомных пресетов с кнопками `↑`/`↓`/`✕` и `+ Add quick filter`.

    **Pruning:** при изменении `quickFilters` (удаление пресета, переключение scope) контейнер вызывает `pruneMissingIds(knownIds)` чтобы убрать активные id, которых больше нет.

18. **FR-18: Резолв полей для client-side JQL/field-матчинга.** Все client-side фильтры Ганта (FR-6 exclusions, FR-16 color rules, FR-17 quick filters) делят один резолвер значений полей — `getFieldValueForJql(issue, fields)` из `src/infrastructure/jira/fields/getFieldValueForJql.ts`. Резолвер:

    1. Принимает массив `JiraField[]` (схема Jira, грузится через `useGetFields()` инфраструктурным хуком и пробрасывается в `GanttDataModel.setFields(...)` контейнером).
    2. По имени из выражения (например `Platform`) находит **все** подходящие `JiraField` по `id` / `name` / `clauseNames` (case-insensitive). Поддержка нескольких совпадений важна потому, что в Jira несколько полей могут иметь одинаковое отображаемое имя.
    3. Для каждого совпадения извлекает значения **по schema** поля:
       - `project` → `[key]`
       - `priority` / `status` / `issuetype` → `[name]`
       - `user` → `[displayName, emailAddress, name]`
       - `option` / `string` → `[value]`
       - `array` of `option` / `string` → `[value, …]`
       - `array` of `component` → `[name, …]`
    4. Если метаданные ещё не загрузились или поле не описано — fallback на raw lookup `issue.fields[name]` + tokenization (`key`/`name`/`id`/`value`/`displayName`/`emailAddress`).

    Результат — массив сравнимых строковых токенов, которые сравниваются с RHS clause через case-insensitive equality. Хелпер шерится с `useSubtasksProgress` (там он раньше жил в private области под именем `getFieldValue`/`getFieldValueForJqlStandalone`); теперь это единственный источник правды.

    **Acceptance trigger:** quick filter `Platform = Backend` показывает только эпики с этим значением (а не пустую диаграмму).

## 4. Сценарии (happy path + важные края)

### S1: Первое открытие (нет настроек)

- **Given** пользователь открыл issue view задачи с сабтасками, настройки mapping ещё не заданы.
- **When** страница загрузилась.
- **Then** вместо диаграммы отображается сообщение «Настройте параметры диаграммы» и кнопка открытия настроек.

### S2: Просмотр Gantt-диаграммы (happy path)

- **Given** пользователь настроил start/end mapping, задачи имеют необходимые поля/переходы.
- **When** страница загрузилась.
- **Then** под основным блоком задачи отображается Gantt-диаграмма с колбасками. Label на каждой — `Key: Summary`.

### S3: Настройка start/end mapping (одно правило)

- **Given** Gantt-диаграмма отображена или показан экран первого запуска.
- **When** пользователь нажимает gear, в секции «Start of bar» оставляет одну строку с «Date field = Created», в секции «End of bar» — одну строку с «Status transition = Done», нажимает Save.
- **Then** модалка закрывается, диаграмма рисуется/перерисовывается с новыми параметрами. Настройки сохранены в localStorage (per project) как `startMappings: [...]`, `endMappings: [...]` с одним элементом в каждом списке.

### S3a: Настройка fallback-источников (priority list)

- **Given** в проекте часть задач имеет заполненный `Due date`, часть — нет, но у всех есть переход в статус «Done».
- **When** пользователь в секции «End of bar» добавляет вторую строку через «+ Add fallback», ставит порядок: 1) Date field = `Due date`, 2) Status transition = `Done`, нажимает Save.
- **Then** для каждой задачи end вычисляется по первому подходящему источнику: задачи с `Due date` берут его, задачи без `Due date` берут момент перехода в `Done`. Задачи без `Due date` и без перехода в `Done` остаются в «issues not shown».

### S3b: Изменение порядка приоритетов

- **Given** в настройках «End of bar» две строки: 1) Status transition = `Done`, 2) Date field = `Due date`.
- **When** пользователь у второй строки нажимает «↑», нажимает Save.
- **Then** порядок становится: 1) Date field = `Due date`, 2) Status transition = `Done`. Для задач с заполненным `Due date` теперь используется именно поле, а не момент перехода в `Done`.

### S4: Задача без конечной даты

- **Given** у сабтаски есть start-дата, но нет end-даты.
- **When** диаграмма рендерится.
- **Then** колбаска рисуется от start до «сегодня», на правом конце — иконка warning.

### S5: Задачи без дат

- **Given** несколько сабтасков не имеют ни start, ни end (по текущему mapping).
- **When** диаграмма рендерится.
- **Then** задачи не на диаграмме; под ней — сворачиваемый блок с перечнем и причинами.

### S6: Включение разбивки по статусам

- **Given** Gantt-диаграмма с простыми колбасками, у задач загружен `changelog`.
- **When** пользователь включает toggle «Разбивка по статусам» в тулбаре.
- **Then** колбаски перерисовываются с цветными секциями. Для каждой задачи количество секций соответствует числу переходов статусов в changelog в окне `[barStart, barEnd]` (плюс начальная секция от `barStart` до первого перехода). Цвет секции = цвет категории её статуса.

### S6a: Цвет секций при отсутствии category в changelog (Jira Server)

- **Given** Jira Server возвращает changelog без полей `fromStatusCategory` / `toStatusCategory`. У задач набора есть текущие статусы трёх категорий: `To Do` (todo), `In Progress` (inProgress), `Done` (done).
- **When** включена разбивка по статусам.
- **Then** секции окрашиваются согласно категории по имени статуса: сегмент с `statusName = "In Progress"` получает blue, `"Done"` — green, `"To Do"` — gray. Категория восстанавливается из карты `statusName → category`, собранной по текущим статусам всех загруженных задач. Статусы, отсутствующие в карте (например, исторический `"Reviewing"`, в котором сейчас никто не сидит), отображаются дефолтным `todo` (gray).

### S7: Zoom и Pan

- **Given** Gantt-диаграмма отображена.
- **When** пользователь крутит wheel (zoom), перетаскивает диаграмму (pan), или выбирает интервал «Weeks» в dropdown.
- **Then** диаграмма плавно масштабируется / перемещается. Ось времени адаптируется к текущему масштабу.

### S8: Исключение задач через фильтры (OR логика)

- **Given** Gantt-диаграмма отображает все связанные задачи.
- **When** пользователь добавляет несколько фильтров исключения (например, `Status = Done` и `Priority = Trivial`), нажимает Save.
- **Then** задачи, соответствующие **хотя бы одному** фильтру, исключаются из диаграммы.

### S8a: Скрыть завершённые задачи через built-in quick filter

- **Given** Gantt-диаграмма отображает все связанные задачи, включая завершённые.
- **When** пользователь кликает chip «Hide completed» в ряду quick filters над диаграммой.
- **Then** задачи с `statusCategory = done` мгновенно скрываются. Появляется hint «N hidden by quick filters» и кнопка clear. После перезагрузки страницы chip снова неактивен (session-only).

### S8c: Quick filters — AND логика и live search

- **Given** Gantt-диаграмма отображает задачи, пользователь добавил кастомный quick filter «Team Alpha» (`team = "Alpha"`).
- **When** пользователь активирует chips «Unresolved» **и** «Team Alpha», набирает в поиске `auth`.
- **Then** видны только задачи, у которых одновременно: `resolution is EMPTY`, `team = "Alpha"`, и в `KEY: Summary` встречается подстрока `auth`. Hint показывает скрытое количество.

### S8d: Quick filter с невалидным JQL не ломает диаграмму

- **Given** пользователь редактирует custom quick filter и оставляет JQL с синтаксической ошибкой.
- **When** пресет сохранён и активирован.
- **Then** matcher графически отмечает ошибку JQL в настройках (live validation), а в рантайме фильтр пропускает все задачи (graceful fallback) — диаграмма не пустеет от опечатки.

### S8b: Сохранение scope level

- **Given** пользователь открыл настройки и выбрал scope «Project + issue type».
- **When** пользователь сохраняет настройки и перезагружает страницу.
- **Then** при следующем открытии scope level восстанавливается как «Project + issue type» (а не сбрасывается на «Project»).

### S9: Пустые данные (нет сабтасков)

- **Given** задача без связанных задач.
- **When** страница загрузилась.
- **Then** пустое состояние: «Нет связанных задач для отображения диаграммы» + кнопка открытия настроек (пользователь мог ошибиться в настройках включения задач).

### S10: Ошибка загрузки данных

- **Given** пользователь открыл issue view.
- **When** запрос связанных задач завершился ошибкой.
- **Then** состояние ошибки с сообщением и кнопкой retry.

### S11: Каскадные настройки — scope selector

- **Given** у пользователя настроен global scope, он просматривает задачу типа Story в проекте PROJECT-A.
- **When** пользователь открывает настройки, выбирает scope «This project + issue type», нажимает «Copy from Global», меняет start mapping, нажимает Save.
- **Then** создаётся конфигурация `PROJECT-A:Story` (копия global + изменённый start mapping). При следующем открытии Story в PROJECT-A используются именно эти настройки. Задачи других типов в PROJECT-A используют global.

### S11a: Модалка открывается на effective scope

- **Given** в storage есть только настройки `PROJECT-A` (project-level), для текущей задачи `PROJECT-A / Story` нет настроек уровня `projectIssueType`. `preferredScopeLevel` сохранён как `projectIssueType` (пользователь раньше открыл этот таб).
- **When** пользователь открывает модалку настроек.
- **Then** scope picker показывает «This project» (а не «This project + issue type»), потому что именно настройки project-уровня сейчас применяются к диаграмме. Форма заполнена значениями из `PROJECT-A`. Если пользователь хочет настроить project+issueType — переключает scope вручную и видит чистую форму с дефолтами или жмёт «Copy from…».

### S12: Hover на колбаске

- **Given** Gantt-диаграмма отображена, пользователь настроил hover-поля.
- **When** пользователь наводит мышку на колбаску, текст которой обрезан на диаграмме.
- **Then** тултип содержит полный `Key: Summary` + выбранные пользователем дополнительные поля.

### S14: Раскраска колбасок по условию

- **Given** пользователь настроил два правила цвета: 1) `Priority = Critical` → красный, 2) `Status = Done` → зелёный.
- **When** диаграмма рендерится, задача PROJ-102 имеет Priority=Critical и Status=In Progress.
- **Then** колбаска PROJ-102 окрашена красным (первое совпавшее правило). Задачи без совпадений — цвет по умолчанию.

### S13: Полноэкранная модалка

- **Given** Gantt-диаграмма отображена с несколькими колбасками, зум 150%.
- **When** пользователь нажимает кнопку «Open in modal» в тулбаре.
- **Then** открывается полноэкранная модалка (100vw × 100vh) с тем же Gantt (toolbar, chart, missing dates), зум сохранён 150%.
- **When** пользователь нажимает Escape или крестик.
- **Then** модалка закрывается, Gantt на странице остаётся с тем же зумом.

## 5. Данные и миграции

- **Источник данных**: Jira REST API через `JiraService.fetchSubtasks` (JQL по `parent`, `"Epic Link"`, `linkedIssues()`; `expand: ['changelog']`).
- **Источник истины настроек**: `localStorage`. Один ключ `jh-gantt-settings`, внутри — payload `{ storage, statusBreakdownEnabled, preferredScopeLevel }` со scope-ключами:

  ```json
  {
    "storage": {
      "_global": {
        "startMappings": [{ "source": "dateField", "fieldId": "created" }],
        "endMappings": [
          { "source": "dateField", "fieldId": "duedate" },
          { "source": "statusTransition", "statusName": "Done" }
        ],
        "colorRules": [],
        "tooltipFieldIds": [],
        "exclusionFilters": [],
        "quickFilters": [
          {
            "id": "8e1c5d2a-…",
            "name": "Team Alpha",
            "selector": { "mode": "jql", "jql": "team = \"Alpha\"" }
          }
        ],
        "includeSubtasks": true,
        "includeEpicChildren": false,
        "includeIssueLinks": false,
        "issueLinkTypesToInclude": []
      },
      "PROJECT-A": { "...": "..." },
      "PROJECT-A:Story": { "...": "..." }
    },
    "statusBreakdownEnabled": false,
    "preferredScopeLevel": "project"
  }
  ```

  Разрешение: `PROJECT-A:Story` > `PROJECT-A` > `_global`. Отсутствие `_global` = первый запуск (S1).

- **Миграции / совместимость**: `parseStoredPayload` → `migrateScope` для каждой scope-настройки:
  - `exclusionFilter` (single object) → `exclusionFilters: [...]` (array).
  - `startMapping` / `endMapping` (single object) → `startMappings: [...]` / `endMappings: [...]` (priority list of one).
  - Отсутствующий `quickFilters` → `[]`.
  - Устаревший `hideCompletedTasks` удаляется при загрузке (никогда не использовался конечными пользователями; функциональность переехала в built-in quick filter `builtin:hideCompleted`, активность session-only).

  Обе формы payload — `{ storage: {...} }` (current) и плоский объект scope-ключей (legacy без обёртки) — поддерживаются и проходят через `migrateScope`.

## 6. Нефункциональные требования

- **Рендеринг**: React + SVG + `d3-scale` (time axis calculations) + `d3-zoom` (zoom/pan behavior). Бандл расширения — не сетевой, размер зависимостей не критичен.
- **Производительность**: Все задачи отображаются as-is, без пагинации. Диаграмма не должна лагать на 50+ задачах. SVG-рендеринг + d3-zoom обеспечивают плавность.
- **Доступность**: Не приоритет. Единственное требование — текст на колбасках должен быть доступен для browser Find (Ctrl+F).
- **Тестирование**:
  - **Vitest**: Models (GanttModel, SettingsModel), утилиты (расчёт позиций, парсинг changelog, обработка edge-кейсов с датами, time scale calculations).
  - **Cypress (.cy.tsx)**: Container-компоненты (настройки, hover-тултипы, zoom/pan).
  - **Storybook**: View-компоненты (GanttBar, GanttChart, SettingsModal, Toolbar — все состояния).

## 7. Вне scope

- Интерактивное редактирование колбасок (drag-to-resize, drag-to-move) — возможно в будущем.
- Поддержка Jira Cloud (next-gen) — только classic Server/DC.
- Board-wide настройки (настройки в localStorage, не в board properties).
- Зависимости между задачами (стрелки между колбасками).
- Экспорт диаграммы (PNG, PDF).
- Группировка задач (по assignee, по эпику и т.д.).

## 8. Открытые вопросы

- [ ] **Ctrl+F на SVG**: SVG text elements доступны для browser Find. Нужно убедиться, что labels рендерятся как `<text>`, а не как изображения.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] На issue view (classic) под блоком деталей отображается Gantt-диаграмма по связанным задачам.
- [ ] При первом открытии (нет настроек) — экран «Настройте параметры» с кнопкой открытия настроек.
- [ ] Колбаски корректно рассчитываются на основе выбранных mappings (date fields или status transitions).
- [ ] **FR-3:** Start и End задаются **списками** источников; для каждой задачи берётся первый источник, давший валидную дату (priority order). UI поддерживает добавление, удаление и перестановку строк (↑/↓).
- [ ] **FR-3:** Старые настройки с одиночным `startMapping`/`endMapping` автоматически мигрируют в `startMappings`/`endMappings` из одного элемента при загрузке storage.
- [ ] Модалка настроек позволяет выбрать start/end mappings, фильтр исключений, hover-поля, правила раскраски колбасок.
- [ ] Настройки сохраняются в localStorage с каскадом (global → project → project+issueType) и восстанавливаются при повторном открытии.
- [ ] Scope selector в модалке настроек позволяет выбрать уровень: Global / Project / Project+IssueType.
- [ ] **FR-10:** Модалка настроек открывается на effective scope: если у текущего scope нет прямых настроек, scope автоматически снапается к более общему уровню, чьи настройки реально применяются к диаграмме.
- [ ] **FR-10:** Инициализация страницы seedит scope по `effectiveScopeLevel ?? preferredScopeLevel` — пользователь сразу видит уровень, на котором лежат настройки.
- [ ] «Copy from...» корректно копирует настройки из существующего scope в новый.
- [ ] Задачи без end-даты отображаются до «сегодня» с иконкой warning.
- [ ] Задачи без start и end не отображаются, а показываются в сворачиваемой секции с причинами.
- [ ] Toggle «Разбивка по статусам» переключает вид колбасок; количество секций соответствует переходам в `issue.changelog`; цвета секций соответствуют jiraColorScheme (green/blue/gray/red).
- [ ] **FR-4:** Когда changelog Jira Server не передаёт `fromStatusCategory` / `toStatusCategory`, цвет секции восстанавливается из карты `statusName → category`, собранной из текущих статусов всех загруженных задач. Известные статусы окрашиваются корректно; неизвестные — дефолтным `todo` (gray).
- [ ] Множественные фильтры исключения (OR логика) корректно исключают задачи из диаграммы.
- [ ] **FR-17:** Quick filters рендерятся отдельным рядом тулбара (search + chips + clear) и применяются поверх FR-5/FR-6 с AND-логикой между chips и search.
- [ ] **FR-17:** Built-in chip «Unresolved» (JQL `resolution is EMPTY`) и «Hide completed» (special matcher по `statusCategory != done`) всегда видны и не редактируются в настройках.
- [ ] **FR-17:** Live search мгновенно фильтрует видимые бары по подстроке `KEY: Summary` (case-insensitive) в режиме `text`.
- [ ] **FR-17:** Live search в режиме `JQL` парсится через `parseJql` + `getFieldValueForJql`, поддерживает custom-fields по display name (`Platform = Backend`); невалидный JQL — graceful fallback (пропускает всё) + красная рамка + tooltip с ошибкой.
- [ ] **FR-17:** Переключатель режима `[Text|JQL]` слева от input; значение `searchQuery` не сбрасывается при переключении; режим — session-only (`text` после reload).
- [ ] **FR-17:** В JQL-режиме при непустом и валидном `searchQuery` появляется кнопка `Save as quick filter`; inline-popover с предзаполненным name; по Save — chip создаётся в текущем scope (через `GanttSettingsModel`), search очищается, режим → `text`, новый chip активируется автоматически.
- [ ] **FR-17:** Активные chips и search — session-only (сбрасываются на reload). Custom presets — персистентны и каскадируются (FR-10).
- [ ] **FR-17:** Custom quick filter в JQL-режиме валидируется через `parseJql` в настройках; невалидный JQL в рантайме graceful-fallback пропускает все задачи.
- [ ] **FR-17:** Custom quick filter в field-режиме сравнивает значение со всеми нормализованными токенами поля (`key`, `name`, `id`, `value`, `displayName`, `emailAddress`).
- [ ] **FR-17:** При удалении пресета из настроек активность по этому id автоматически снимается (pruning).
- [ ] **FR-18:** Quick filter / exclusion / color rule в JQL-режиме корректно резолвит custom fields по display name (`Platform = Backend` отдаёт ровно те задачи, у которых `customfield_NNNNN` включает option `Backend`). Регресс покрыт `getFieldValueForJql.test.ts`.
- [ ] **FR-18:** Резолвер устойчив к ещё не загруженным метаданным — пока `useGetFields()` отдаёт `[]`, JQL по системным полям и по сырым `customfield_NNNNN` продолжает работать (fallback raw lookup).
- [ ] **FR-18:** Shared helper `getFieldValueForJql` используется и Gantt-фичей, и `sub-tasks-progress` — нет двух копий логики.
- [ ] Label на колбаске — `Key: Summary`; если не влезает — обрезается с `…`.
- [ ] Hover на колбаске показывает тултип с полным `Key: Summary` + настроенные поля.
- [ ] Правила раскраски колбасок (color rules) работают: first match wins, задачи без match — цвет по умолчанию.
- [ ] Zoom: wheel zoom + кнопки +/- + dropdown выбора интервала (hours/days/weeks/months).
- [ ] Pan: drag в любом месте + scrollbars.
- [ ] Тулбар над диаграммой содержит: zoom controls, dropdown интервала, кнопку настроек, toggle статусов.
- [ ] Диаграмма не лагает при 50+ задачах.
- [ ] При отсутствии связанных задач отображается пустое состояние.
- [ ] При ошибке загрузки отображается состояние ошибки с кнопкой retry.

## 10. UI Wireframe

### Gantt-диаграмма (happy path)

```
+-- Gantt Chart -------------------------------------------+
|                                                          |
| [- ] [+]  [Days    v]    [x] Status breakdown    [⚙️]    |
| ─────────────────────────────────────────────────────────|
|            | Apr 7  | Apr 8  | Apr 9  | Apr 10 | Apr 11 |
| ──────────|--------|--------|--------|--------|---------|
| PROJ-101  |  ██████████████████████                      |
| PROJ-102  |         ████████████████████████              |
| PROJ-103  |                  ███████████████████░░░ ⚠     |
| PROJ-104  |  ████████████                                |
| PROJ-105  |                           ██████████████████ |
|           |        |        |        |        |         |
|           ◄════════════════════════════════════►  ──     |
+----------------------------------------------------------+
|                                                          |
| ▸ 2 issues not shown (missing dates)                     |
+----------------------------------------------------------+
```

**Легенда:**
- `[- ] [+]` — кнопки zoom out / zoom in
- `[Days v]` — dropdown выбора интервала
- `[x] Status breakdown` — toggle разбивки
- `[⚙️]` — кнопка открытия модалки настроек
- `██` — колбаска задачи (однотонная)
- `░░░ ⚠` — колбаска без end-даты (до сегодня + warning)
- `◄══►` — горизонтальный scrollbar
- `▸ 2 issues...` — сворачиваемая секция

### Gantt с разбивкой по статусам

```
+-- Gantt Chart -------------------------------------------+
|                                                          |
| [- ] [+]  [Days    v]    [■] Status breakdown    [⚙️]    |
| ─────────────────────────────────────────────────────────|
|            | Apr 7  | Apr 8  | Apr 9  | Apr 10 | Apr 11 |
| ──────────|--------|--------|--------|--------|---------|
| PROJ-101  |  ░░░░▓▓▓▓▓▓▓▓▓▓████████                     |
| PROJ-102  |         ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓████████            |
| PROJ-103  |                  ░░░░░▓▓▓▓▓▓▓▓▓▓▓ ⚠          |
|           |        |        |        |        |         |
+----------------------------------------------------------+
```

**Легенда (цвета статусов):**
- `░░` — todo (gray)
- `▓▓` — inProgress (blue)
- `██` — done (green)

### Первый запуск (нет настроек)

```
+-- Gantt Chart -------------------------------------------+
|                                                          |
|                                                          |
|       (i) Configure chart parameters to display          |
|           the Gantt diagram                              |
|                                                          |
|                    [Open Settings]                        |
|                                                          |
+----------------------------------------------------------+
```

### Секция «Issues not shown» (развёрнутая)

```
+----------------------------------------------------------+
| ▾ 2 issues not shown (missing dates)                     |
|                                                          |
|  PROJ-106  Fix login bug         No start date           |
|  PROJ-107  Update docs           No start, no end date   |
|                                                          |
+----------------------------------------------------------+
```

### Hover-тултип

```
            ┌─────────────────────────┐
            │ PROJ-101                │
            │ ──────────────────────  │
            │ Summary: Auth service   │
            │ Assignee: @john.doe    │
            │ Status: In Progress    │
            │ Priority: High         │
            └─────────────────────────┘
   ██████████████████████████
```

### Модалка настроек

```
+-- Gantt Settings ─────────────────────────────+
|                                                |
|  Scope: [Global              v]  [Copy from…]  |
|  ─────────────────────────────────────────────  |
|                                                |
|  Start of bar  (first match wins)              |
|  ┌──────────────────────────────────────────┐  |
|  │ 1. [Date field        v] [Created    v]  │  |
|  │                          [↑] [↓] [✕]     │  |
|  │ 2. [Status transition v] [In Progress v] │  |
|  │                          [↑] [↓] [✕]     │  |
|  │ [+ Add fallback]                         │  |
|  └──────────────────────────────────────────┘  |
|  (i) Each row is tried in order; first source  |
|      that yields a date wins. Last row cannot  |
|      be removed.                               |
|                                                |
|  End of bar  (first match wins)                |
|  ┌──────────────────────────────────────────┐  |
|  │ 1. [Date field        v] [Due date   v]  │  |
|  │                          [↑] [↓] [✕]     │  |
|  │ 2. [Status transition v] [Done       v]  │  |
|  │                          [↑] [↓] [✕]     │  |
|  │ [+ Add fallback]                         │  |
|  └──────────────────────────────────────────┘  |
|                                                |
|  ─────────────────────────────────────────────  |
|                                                |
|  Hover detail fields                           |
|  [x] Summary                                  |
|  [x] Assignee                                 |
|  [x] Status                                   |
|  [ ] Priority                                 |
|  [ ] Created                                  |
|                                                |
||  Bar colors (first match wins)                 |
||  +-- Rule 1 ──────────────────────────────+   |
||  |  [Field value v]                       |   |
||  |  Field: [Priority     v]               |   |
||  |  Value: [Critical_____]                |   |
||  |  Color: [🔴 Red       v]               |   |
||  |                          [✕ Remove]    |   |
||  +----------------------------------------+   |
||  +-- Rule 2 ──────────────────────────────+   |
||  |  [Field value v]                       |   |
||  |  Field: [Status       v]               |   |
||  |  Value: [Done_________]                |   |
||  |  Color: [🟢 Green     v]               |   |
||  |                          [✕ Remove]    |   |
||  +----------------------------------------+   |
||  [+ Add color rule]                           |
||                                                |
|  ─────────────────────────────────────────────  |
|                                                |
|  [x] Hide completed tasks (statusCategory=Done) |
|                                                |
|  Exclusion filters (OR — any match excludes)   |
|  (i) Issue excluded if it matches ANY filter   |
|  +-- Filter 1 ──────────────────────────────+  |
|  |  [Field value v]                         |  |
|  |  Field: [Status       v]                 |  |
|  |  Value: [Cancelled____]     [✕ Remove]   |  |
|  +------------------------------------------+  |
|  [+ Add exclusion filter]                      |
|                                                |
|                    [Cancel]          [Save]     |
+------------------------------------------------+
```

**Легенда:**
- `[... v]` — dropdown
- `(o) / ( )` — radio buttons
- `[x] / [ ]` — checkboxes
- `[Copy from…]` — копирование настроек из другого scope
- Scope dropdown: `Global` / `PROJECT-A` / `PROJECT-A > Story`

### Модалка «Copy from...»

```
+-- Copy settings from ──────────+
|                                 |
|  ( ) Global                    |
|  (o) PROJECT-A                 |
|  ( ) PROJECT-A > Bug           |
|  ( ) PROJECT-B                 |
|                                 |
|           [Cancel]     [Copy]   |
+---------------------------------+
```

---

## Changelog

- **2026-04-21** — расширен FR-17: live search получил два режима (`text`/`JQL`) + кнопка `Save as quick filter`. Триггер: пользователь в чате («поиск по саммари+key — ОК, хочу ещё JQL»). Категория: requirements change. Затронуто: TASK-44 (новая).
