# TASK-108: wiplimit-on-cells + charts-add-sla-line diagnostic

**Status**: DONE
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

- [x] featureName `charts-add-sla-line` (kebab, §5.4)
- [x] Unit test per callback
- [x] Тесты проходят: `npm test` (diagnostic tests; full suite: unrelated timeout in CommentTemplatesSettings)
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `wiplimit-on-cells/diagnosticRegistration.ts` — callback читает `useWipLimitCellsPropertyStore` (`wipLimitCells`), регистрация в `content.ts`
- `charts/diagnosticRegistration.ts` + `slaConfigSnapshot.ts` — read-only cache `slaConfig3`, обновляется в `AddSlaLine.apply`/`onSave`
- Unit-тесты: `diagnosticRegistration.test.ts` для обеих фич (по 3 теста)
- ESLint на изменённых файлах — без ошибок

**Проблемы и решения**:

- `vi.spyOn` на `setState` в zustand store давал `Cannot redefine property` — убран spy, оставлена проверка snapshot через `collectDiagnosticReport`.
- Полный `npm test`: 1 unrelated timeout в `CommentTemplatesSettings.test.tsx` (не из TASK-108).
