# TASK-98: DiagnosticModel

**Status**: DONE
**Type**: model

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Реализовать Valtio-backed `DiagnosticModel`: in-memory registry callbacks, `collectDiagnosticReport()`, `buildExportPayload()`, `saveDiagnosticData()` с отказоустойчивостью и serialization checks.

## Файлы

```
src/features/diagnostic-module/models/
├── DiagnosticModel.ts       # новый
└── DiagnosticModel.test.ts  # новый
```

## Что сделать

1. TDD: unit tests для registry, last-write-wins, throw/Err isolation, per-feature JSON.stringify check, fallback export legacy-only.
2. Реализовать `DiagnosticModel` по spec в target-design.
3. Public reactive field `registeredFeatures: string[]`; private `Map` для callbacks.
4. `buildExportPayload()`: legacy fields + `featureDiagnostics`.
5. `saveDiagnosticData()`: download JSON; safety net при финальном stringify.
6. Constructor inject `Logger`; `pluginVersion` из manifest.

## Критерии приёмки

- [ ] Покрыты сценарии S2, S3 из requirements + §5.7 serialization
- [ ] `collectDiagnosticReport` не прерывается при ошибке одной фичи
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-97](./TASK-97-diagnostic-types-and-tokens.md)
- Референс: [target-design.md](./target-design.md), `docs/state-valtio.md`
