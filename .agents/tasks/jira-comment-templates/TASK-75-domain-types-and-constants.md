# TASK-75: Domain Types And Constants

**Status**: VERIFICATION
**Type**: types

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Создать базовые domain-типы и константы фичи `jira-comment-templates-module`. Эта задача задаёт общий контракт для Storage, Settings, Editor и PageObject-интеграции, не создавая моделей или UI.

## Файлы

```
src/features/jira-comment-templates-module/
├── types.ts        # новый
└── constants.ts    # новый
```

## Что сделать

1. Описать `CommentTemplate`, `EditableCommentTemplate`, `CommentTemplateSummary`, validation, notification и watcher result types из target design.
2. Добавить opaque-типы `CommentTemplateId` и связанные request/result types для вставки шаблона.
3. Вынести storage key `jira_helper_comment_templates`, attachment key `jira-comment-templates`, marker attributes и UI constants.
4. Добавить JSDoc к публичным типам, где lifecycle или ownership неочевидны.
5. Проверить, что типы не импортируют React, DOM или конкретные модели.
6. Убедиться, что `AddWatchersResult` может типобезопасно представить `skipped` при отсутствии `issueKey`.

## Критерии приёмки

- [x] Domain-типы покрывают Storage, Settings и Editor contracts из `target-design.md`.
- [x] Константы не содержат runtime-зависимостей и могут использоваться в unit tests.
- [x] Нет feature-local Jira client или storage repository abstraction.
- [x] Watcher result contract: `skipped` при отсутствующем контексте задачи представлен через `issueKey: string | null` и при необходимости `reason: 'missing-issue-key'`; sentinel-значения для ключа не требуются; без Jira watcher requests при unresolved issue key (см. target-design, правила агрегации).
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: нет.
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлен `src/features/jira-comment-templates-module/types.ts`: доменные типы и контракты из `target-design.md` (шаблоны, payload v1 и legacy import, validation, notification, insert/watcher results, `CommentEditorInsertResult`, state snapshots для Storage/Editor/Settings, интерфейсы `ITemplatesStorageModel`, `ICommentTemplatesEditorModel`, `ICommentTemplatesSettingsModel` с `Promise<Result<...>>` через type-only импорт `ts-results`).
- После `REVIEW-TASK-75`: `AddWatchersResult` согласован с обновлённым target-design — `issueKey: string | null`, опционально `reason?: 'empty-watchers' | 'missing-issue-key'`, явный контракт в JSDoc, что при отсутствующем ключе задачи watcher-запросы к Jira не выполняются.
- Identifiers: nominal branded strings для `CommentTemplateId` / `CommentEditorId` (`string & { readonly __commentTemplateId: never }` / `__commentEditorId`) и граничные хелперы `toCommentTemplateId` / `toCommentEditorId` для парсинга JSON и маркировки строк, выданных PageObject.
- Добавлен `src/features/jira-comment-templates-module/constants.ts`: ключ localStorage (`jira_helper_comment_templates`), версия payload `1`, ключ `attachTools` (`jira-comment-templates`), имена маркерных `data-*` атрибутов (`data-jira-helper-tool`, `data-jira-helper-comment-editor-id`), `COMMENT_TEMPLATES_NOTIFICATION_AUTO_HIDE_MS = 5000`.
- JSDoc у идентификаторов и контрактов с неочевидным lifecycle/ownership; без React, DOM и feature-local Jira/storage repository.

**Проблемы и решения**:

- **Critical (review) — `AddWatchersResult` и missing issue key**: ранее тип требовал `issueKey: string`, что конфликтовало со сценарием успешной вставки текста без вызова `addWatcher`. Решение: как в target-design после `BLOCKED_BY_DESIGN` — `issueKey: string | null`, для `skipped` при необходимости `reason: 'missing-issue-key'` или `'empty-watchers'`; описание правил без sentinel key в коде модели (будущий `CommentTemplatesEditorModel`).
- **Warning (review) — opaque ids**: заменены plain `string`-алиасы на branded nominal types плюс `toCommentTemplateId` / `toCommentEditorId` на границах без расширения scope на инфраструктуру. Краткий сниппет в цитате «TypeScript Contracts» у `target-design.md` может по-прежнему показывать `CommentTemplateId = string` для читаемости; канонический контракт — фактический `types.ts`.
- `CommentEditorId` по-прежнему дублируется в типах фичи до появления `ICommentsEditorPageObject.ts`; конвергенция описана в target-design.

**Проверки**:

- `npx eslint src/features/jira-comment-templates-module/types.ts src/features/jira-comment-templates-module/constants.ts --fix` — OK.
- `npm test -- --run` — OK (133 test files / 1455 tests).
- `npm run build:dev` — OK.
