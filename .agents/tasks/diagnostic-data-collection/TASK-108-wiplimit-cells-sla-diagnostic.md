# TASK-108: wiplimit-on-cells + charts-add-sla-line diagnostic

**Status**: TODO
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callbacks для `wiplimit-on-cells` и `charts-add-sla-line`. При необходимости — read-only snapshot/cache providers.

## Файлы

```
src/features/wiplimit-on-cells/
└── diagnosticRegistration.ts       # новый

src/features/charts/
└── diagnosticRegistration.ts       # новый (AddSlaLine)
```

## Что сделать

1. `wiplimit-on-cells`: callback с cached `wipLimitCells` snapshot (requirements §5).
2. `charts-add-sla-line`: callback key `charts-add-sla-line`, SLA config snapshot `slaConfig3`.
3. Добавить read-only cache provider если snapshot не exposed.
4. Unit test каждого callback.

## Критерии приёмки

- [ ] featureName `charts-add-sla-line` (kebab, §5.4)
- [ ] Unit test per callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
