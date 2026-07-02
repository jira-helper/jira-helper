# TASK-97: Diagnostic types and tokens

**Status**: DONE
**Type**: types

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Создать контракты diagnostic data collection: типы отчёта, callback, export payload и DI tokens (`diagnosticModelToken`, `diagnosticBoardPageToken`).

## Файлы

```
src/features/diagnostic-module/
├── types.ts    # новый
└── tokens.ts   # новый
```

## Что сделать

1. Реализовать типы из target-design: `JsonValue`, `FeatureDiagnosticData`, `FeatureDiagnosticError`, `DiagnosticReport`, `FeatureDiagnosticCallback`, `CollectedDiagnosticPayload`, `DiagnosticModelApi`.
2. Создать `diagnosticModelToken` (`createModelToken`, id `diagnostic-module/diagnosticModel`).
3. Перенести declare `diagnosticBoardPageToken` из `BoardPage.ts` в `tokens.ts`; `BoardPage.ts` импортирует token из tokens.
4. JSDoc на tokens: lifecycle, consumers (requirements §5.5, developer-guide).

## Критерии приёмки

- [ ] Типы соответствуют [target-design.md](./target-design.md) и [requirements.md](./requirements.md) §5.3–§5.4
- [ ] `diagnosticBoardPageToken` типизирован как `Token<DiagnosticBoardPage>`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-96](./TASK-96-migrate-diagnostic-module-folder.md)
- Референс: `src/features/column-limits-module/tokens.ts`
