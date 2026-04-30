# Request: Перенести Jira Comment Templates в jira-helper

**Дата**: 2026-04-29
**Slug**: `jira-comment-templates`
**Тип**: UI
**Has UI**: yes
**Scope**: large

## Описание запроса

Пользователь попросил перенести фичу из локального расширения `~/Downloads/jira-templates-extension` в текущий проект `jira-helper`.

Исходное расширение называется `Jira Comment Templates – TCS` и работает на `https://jira3.tcsbank.ru/`*. Оно добавляет быстрые шаблоны комментариев в Jira:

1. Встраивает тулбар `Шаблоны` в формы комментариев Jira.
2. Показывает кнопки пользовательских шаблонов рядом с редактором комментария.
3. По клику вставляет текст шаблона в текущий комментарий.
4. Поддерживает редакторы Jira в нескольких режимах: textarea, contenteditable / ProseMirror-like DOM, TinyMCE iframe.
5. Позволяет управлять шаблонами через модальное окно:
  - добавить шаблон;
  - изменить название кнопки;
  - изменить текст шаблона;
  - выбрать цвет кнопки;
  - удалить шаблон;
  - сохранить изменения.
6. Поддерживает импорт и экспорт списка шаблонов в JSON-файл.
7. Может добавлять watchers к текущей задаче через Jira REST API, если у шаблона заполнен список логинов.
8. Хранит шаблоны локально в браузере.
9. Имеет popup расширения со статусом, количеством шаблонов и сбросом к умолчаниям.

Цель этапа: не переносить код напрямую, а зафиксировать требования для реализации этой фичи в архитектуре `jira-helper`.

## Анализ исходной реализации

### Файлы источника

- `manifest.json` — MV3 manifest, `storage` permission, host `jira3.tcsbank.ru`, content script + popup.
- `content.js` — основная логика тулбара, вставки текста, модалки, импорта/экспорта, watchers.
- `styles.css` — стили тулбара, кнопок, modal, dark theme variables.
- `popup.html` / `popup.js` — popup с количеством шаблонов и reset to defaults.

### Выявленные доменные сущности

- Template:
  - `id`;
  - `label`;
  - `color`;
  - `text`;
  - optional `watchers`.
- Color:
  - `id`;
  - `label`;
  - `bg`;
  - `border`;
  - `text`.
- Templates storage:
  - ключ источника: `jira_cnt_templates`;
  - хранение локальное, не board-specific.
- Comment editor target:
  - textarea / input;
  - contenteditable / DOM editor;
  - TinyMCE iframe.

### Риски прямого переноса

- Исходный код напрямую работает с DOM и `fetch`; в `jira-helper` это нужно разнести по PageObject / JiraClient / Model согласно `docs/architecture_guideline.md`.
- Исходные inline styles и innerHTML нужно заменить на React View-компоненты и CSS modules там, где UI принадлежит jira-helper.
- Нужно согласовать, нужна ли фича только для `jira3.tcsbank.ru` и проекта CNT или для всех Jira-инстансов, где работает `jira-helper`.
- Popup исходного расширения может быть не нужен, если управление шаблонами будет доступно прямо в Jira.

## Уточнения

### Раунд 1 — 2026-04-29

- Целевая область: фича должна работать на всех Jira-инстансах, где работает `jira-helper`, а не только на `jira3.tcsbank.ru` или CNT.
- Watchers входят в MVP: шаблон может добавлять watchers к текущей задаче.
- Popup исходного расширения не нужен: настройки должны жить внутри UI `jira-helper`.
- Popup финально исключён из MVP. Поскольку popup не делаем, можно хранить настройки в `localStorage` content script / Jira context; `chrome.storage.local` не нужен для MVP.
- Нужны 2 дефолтных шаблона комментариев, чтобы пользователи понимали формат работы. Шаблоны должны быть generic, без CNT-брендинга.
- Импорт JSON должен загружать шаблоны в draft модалки; сохранять в `localStorage` только после явного нажатия `Сохранить`.
- Автоматическая миграция из старого расширения не нужна, но нужно поддержать импорт JSON, экспортированного старым расширением `Jira Comment Templates – TCS`.
- Watchers не нужно предварительно валидировать как логины до отправки в Jira API.
- Dark theme не является отдельным продуктовым требованием; упоминание появилось из исходного `styles.css`, но для MVP достаточно не ломать базовую тему Jira и использовать наследуемые цвета/контраст.
- Пользователь попросил уточнить:
  - где именно сейчас исходное расширение встраивает тулбар;
  - что реализовано в popup;
  - какие сейчас есть CNT-шаблоны и что означает CNT.
- Пользователь попросил проверить живую Jira и понять, куда должна вставляться кнопка:
  - комментарий задачи на board: `https://jira.tcsbank.ru/secure/RapidBoard.jspa?rapidView=24516&quickFilter=196557&quickFilter=196545`;
  - комментарий на экране задачи и комментарий при переводе в `Trashed`: `https://jira.tcsbank.ru/browse/TTP-19539`.

### Live-проверка Jira — 2026-04-29

- Board detail panel:
  - URL после выбора задачи: `RapidBoard.jspa?...&view=detail&selectedIssue=<ISSUE_KEY>...`;
  - блок комментария: `#addcomment.module.ghx-detail-section.ghx-no-tab-menu`;
  - editor: `.jira-wikifield`, `#comment-wiki-edit`, `textarea#comment`, `rich-editor`;
  - submit/cancel: `#issue-comment-add-submit`, `#issue-comment-add-cancel`;
  - кнопка открытия комментария также встречается как `#footer-comment-button` / `#comment-issue`.
- Issue view `TTP-19539`:
  - кнопка открытия: `#comment-issue.add-issue-comment.inline-comment`;
  - блок комментария: `#addcomment.module`;
  - form action: `/secure/AddComment.jspa?...`;
  - editor: `.jira-wikifield`, `#comment-wiki-edit`, `textarea#comment`, `rich-editor`;
  - submit/cancel: `#issue-comment-add-submit`, `#issue-comment-add-cancel`.
- Transition `Trashed`:
  - кнопка: `#action_id_11`;
  - dialog: `#workflow-transition-11-dialog.jira-dialog`;
  - form action: `/secure/CommentAssignIssue.jspa?...`;
  - comment label: `CommentRequired`;
  - editor: `.jira-wikifield`, `#comment-wiki-edit`, `textarea#comment`, `rich-editor`;
  - submit/cancel: `#issue-workflow-transition-submit`, `#issue-workflow-transition-cancel`.
- Transition не был отправлен: dialog закрыт через cancel после инспекции.