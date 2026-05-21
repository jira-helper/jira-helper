# TASK-110: jira-comment-templates-module diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callback для `jira-comment-templates-module`: localStorage summary templates (`version`, `templatesCount`, `enabled`).

## Файлы

```
src/features/jira-comment-templates-module/
├── module.ts                    # update register()
└── module.diagnostic.test.ts    # новый
```

## Что сделать

1. Read-only snapshot from TemplatesStorageModel (или `getDiagnosticSnapshot()` если нет safe API).
2. Register `jira-comment-templates-module` callback.
3. Payload per requirements §5.
4. Unit test diagnostic callback.

## Критерии приёмки

- [x] Без вызова load/save в callback
- [x] Unit test diagnostic callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `TemplatesStorageModel.getDiagnosticSnapshot()` — `version`, `templatesCount`, `enabled` (read-only, без I/O)
- `registerDiagnosticData('jira-comment-templates-module', …)` в `module.ts` (§5.3: `boardProperty: null`, `localStorage.commentTemplates`, `runtime: null`)
- `module.diagnostic.test.ts` + тесты snapshot в `TemplatesStorageModel.test.ts`
- В существующих тестах модуля добавлены `loggerToken` + `diagnosticModule.ensure` перед `jiraCommentTemplatesModule.ensure`

**Проблемы и решения**:

- `module.test` / `CommentTemplatesPageModification.test` падали без `diagnosticModelToken` и `loggerToken` — в `beforeEach` добавлены `Logger` и `diagnosticModule.ensure`.

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
