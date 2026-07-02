# TASK-56: Gantt Date Mapping Id Lookup

**Status**: DONE
**Type**: model

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Перевести расчёт Gantt `statusTransition` date mappings на сравнение с changelog status id. Legacy `statusName` может оставаться display/fallback metadata, но не должен давать ложное совпадение по имени.

## Файлы

```text
src/features/gantt-chart/utils/
├── computeBars.ts       # изменение
└── computeBars.test.ts  # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-2` Gantt status transition mapping matches changelog from and to ids
- `@SC-PSM-GANTT-3` Legacy status transition name is fallback metadata only

## Тесты

- Vitest: start/end mapping `{ source: 'statusTransition', statusId }` matches `fromStatusId` / `toStatusId`.
- Vitest: mapping with only legacy `statusName` does not resolve date by `toStatusName`.
- Vitest: two statuses with same display name but different ids do not collide.

## Что сделать

1. Обновить date mapping lookup в `computeBars.ts` на `statusId`.
2. Убрать runtime matching по `statusName` для statusTransition.
3. Добавить compatibility path: legacy rows без `statusId` не ломают расчёт, но не дают id-less match.
4. Обновить тесты на id semantics.

## Критерии приёмки

- [ ] Gantt bar start/end dates резолвятся по changelog ids.
- [ ] Legacy `statusName` не создаёт false-positive date match.
- [ ] Тесты проходят: `npm test -- computeBars`.
- [ ] Исправление не добавляет новую progress mapping настройку.

## Зависимости

- Зависит от: [TASK-55](./TASK-55-gantt-changelog-status-ids.md).
- Блокирует: [TASK-70](./TASK-70-gantt-status-mapping-cypress.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added `statusId` to Gantt `DateMapping` as the canonical `statusTransition` runtime key.
- Updated `computeBars` statusTransition date lookup to match changelog `fromStatusId` / `toStatusId` instead of display names.
- Added Vitest coverage for id lookup, legacy name-only no-match behavior, and duplicate display names with different ids.

**Проблемы и решения**:

No blockers. Legacy `statusName` remains metadata only and does not create runtime date matches.
