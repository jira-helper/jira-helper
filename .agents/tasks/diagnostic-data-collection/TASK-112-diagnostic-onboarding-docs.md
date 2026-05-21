# TASK-112: Diagnostic onboarding docs

**Status**: DONE
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

- [x] JSDoc на public types в types.ts
- [x] developer-guide актуален post-implementation
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: TASK-102 … TASK-111 (после всех feature registrations)

---

## Результаты

**Дата**: 2026-05-21

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- JSDoc на `FeatureDiagnosticData`, `FeatureDiagnosticError`, `DiagnosticReport`, `FeatureDiagnosticCallback`, `CollectedDiagnosticPayload` и `DiagnosticModelApi.registerDiagnosticData` с `@see` на developer-guide / requirements §5.3
- developer-guide: ссылка на EPIC-7, таблица 14 v1 `featureName`, актуализирован legacy-пример (`diagnosticRegistration.ts`), уточнены import paths
- EPIC-7: статус TASK-112 → VERIFICATION

**Проверка**: `npm test` (170 files / 1743 tests), `lint:eslint --fix`, `lint:typescript` — exit 0.

**Проблемы и решения**:

Нет.
