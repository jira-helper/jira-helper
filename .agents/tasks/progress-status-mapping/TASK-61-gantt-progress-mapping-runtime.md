# TASK-61: Gantt Progress Mapping Runtime

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Подключить custom status progress mapping к Gantt runtime расчёту прогресса/status sections. Расчёт должен использовать shared resolver и matching по status id, не смешиваясь с UI сохранением настроек.

## Файлы

```text
src/features/gantt-chart/utils/
├── computeBars.ts       # изменение
└── computeBars.test.ts  # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-1` Configure Gantt status id mapping
- `@SC-PSM-DEFAULT-1` Missing settings block uses default Jira statusCategory mapping
- `@SC-PSM-AUTO-4` Missing Jira status shows fallback label but matching remains id-only

## Тесты

- Vitest: linked issue with `statusId = 10001` and custom mapping to `done` is counted/rendered as done.
- Vitest: same `statusName` with different id does not use the custom mapping.
- Vitest: missing mapping block falls back to Jira `statusCategory`.

## Что сделать

1. Pass `statusProgressMapping` from resolved Gantt settings into progress/status calculation path.
2. Call shared `resolveProgressBucket` from [TASK-54](./TASK-54-resolve-progress-bucket.md).
3. Ensure status id fields introduced by [TASK-55](./TASK-55-gantt-changelog-status-ids.md) are used where status sections need id-aware category mapping.
4. Avoid UI/persistence changes in this TASK.

## Критерии приёмки

- [ ] Gantt progress/status calculation respects custom mapping by id.
- [ ] Default category behavior is unchanged when mapping is absent.
- [ ] Names are display-only and do not affect matching.
- [ ] Тесты проходят: `npm test -- computeBars`.

## Зависимости

- Зависит от: [TASK-54](./TASK-54-resolve-progress-bucket.md), [TASK-55](./TASK-55-gantt-changelog-status-ids.md), [TASK-60](./TASK-60-gantt-progress-mapping-storage.md).
- Блокирует: [TASK-70](./TASK-70-gantt-status-mapping-cypress.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Updated `computeBars` to apply custom progress bucket mapping by Jira status id.
- Added current issue status id support to Gantt issue input.
- Applied id-based mapping to changelog-derived status section categories.
- Added tests for custom mapping, default fallback, and name-only non-matching.

**Проблемы и решения**:

No blockers. Review APPROVED and QA PASS.
