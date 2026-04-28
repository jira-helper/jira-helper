# TASK-60: Gantt Progress Mapping Storage

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Расширить Gantt settings storage optional-блоком `statusProgressMapping`. Отсутствующий блок должен оставаться валидным и означать default Jira statusCategory behavior.

## Файлы

```text
src/features/gantt-chart/
├── types.ts                         # изменение
└── models/
    ├── GanttSettingsModel.ts        # изменение
    └── GanttSettingsModel.test.ts   # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-1` Configure Gantt status id mapping
- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping

## Тесты

- Vitest: default scope settings can omit `statusProgressMapping`.
- Vitest: existing localStorage payloads without the block load unchanged.
- Vitest: valid mapping rows persist as `{ statusId, statusName, bucket }`.
- Vitest: invalid rows without `statusId` or with bucket outside `todo` / `inProgress` / `done` are dropped or normalized per target design.

## Что сделать

1. Add `statusProgressMapping?: StatusProgressMapping` to `GanttScopeSettings`.
2. Import shared mapping type from [TASK-53](./TASK-53-status-progress-types.md).
3. Extend model migration/load/save normalization without introducing a separate save error UI.
4. Keep legacy localStorage compatibility.

## Критерии приёмки

- [ ] Gantt settings storage accepts optional mapping block.
- [ ] Missing block remains backward-compatible.
- [ ] Invalid buckets cannot be persisted by model normalization.
- [ ] Тесты проходят: `npm test -- GanttSettingsModel`.

## Зависимости

- Зависит от: [TASK-53](./TASK-53-status-progress-types.md).
- Блокирует: [TASK-61](./TASK-61-gantt-progress-mapping-runtime.md), [TASK-62](./TASK-62-gantt-progress-mapping-settings-ui.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added optional `statusProgressMapping` to `GanttScopeSettings`.
- Added Gantt settings load/save normalization for valid id-keyed rows and invalid row removal.
- Added model tests for omitted default block, legacy payload compatibility, valid persistence, and invalid-row dropping.

**Проблемы и решения**:

No blockers. Review APPROVED and QA PASS.
