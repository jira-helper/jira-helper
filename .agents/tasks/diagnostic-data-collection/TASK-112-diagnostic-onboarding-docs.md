# TASK-112: Diagnostic onboarding docs

**Status**: TODO
**Type**: other

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Финализировать onboarding документацию: JSDoc на public API в `types.ts`, cross-links, проверка актуальности [developer-guide.md](./developer-guide.md) после реализации.

## Файлы

```
src/features/diagnostic-module/types.ts
.agents/tasks/diagnostic-data-collection/developer-guide.md
```

## Что сделать

1. JSDoc на `FeatureDiagnosticCallback`, `registerDiagnosticData` contract, `CollectedDiagnosticPayload`, convention §5.3 ссылка на developer-guide.
2. Review developer-guide против фактической реализации — обновить примеры import paths / API если отличаются.
3. Добавить в developer-guide ссылку на EPIC-7 и список featureName §5.

## Критерии приёмки

- [ ] JSDoc на public types в types.ts
- [ ] developer-guide актуален post-implementation
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: TASK-102 … TASK-111 (после всех feature registrations)
