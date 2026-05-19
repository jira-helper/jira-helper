# TASK-110: jira-comment-templates-module diagnostic

**Status**: TODO
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

- [ ] Без вызова load/save в callback
- [ ] Unit test diagnostic callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
