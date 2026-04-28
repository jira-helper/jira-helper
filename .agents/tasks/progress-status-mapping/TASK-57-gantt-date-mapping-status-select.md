# TASK-57: Gantt Date Mapping Status Select

**Status**: DONE
**Type**: container

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Обновить существующий UI выбора `statusTransition` в `GanttSettingsModal`, чтобы он сохранял status id, а имя оставлял только как fallback/debug label. Это относится к существующим Start/End of bar mappings, не к новой progress mapping секции.

## Файлы

```text
src/features/gantt-chart/IssuePage/components/
├── GanttSettingsModal.tsx       # изменение
└── GanttSettingsModal.test.tsx  # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-2` Gantt status transition mapping matches changelog from and to ids
- `@SC-PSM-GANTT-3` Legacy status transition name is fallback metadata only

## Тесты

- Component/Vitest: selecting a status transition option writes `{ source: 'statusTransition', statusId, statusName }`.
- Component/Vitest: legacy row with only `statusName` renders fallback label but requires reselect to save id.
- Component/Vitest: changing mapping source resets incompatible detail values without preserving stale names as ids.

## Что сделать

1. Изменить form row shape для date mappings: status option value должен быть `status.id`.
2. Сохранять selected label как optional `statusName`.
3. Использовать `useGetStatuses()` options как source of truth для labels.
4. Обновить тесты существующего modal behavior.

## Критерии приёмки

- [ ] Existing Start/End of bar statusTransition select сохраняет status id.
- [ ] Legacy `statusName` показывается как fallback/debug, но не становится canonical value.
- [ ] Тесты проходят: `npm test -- GanttSettingsModal`.
- [ ] Новая progress mapping секция не добавляется в этой TASK.

## Зависимости

- Зависит от: [TASK-55](./TASK-55-gantt-changelog-status-ids.md).
- Блокирует: [TASK-70](./TASK-70-gantt-status-mapping-cypress.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Updated existing Gantt date-mapping status select options to use Jira `status.id` as value.
- Persisted selected `statusName` separately as fallback/debug metadata.
- Preserved legacy `statusName`-only rows as display fallback without converting the name into a canonical id.
- Added modal tests for id save, fallback rendering, and source-change cleanup.

**Проблемы и решения**:

No blockers. Legacy rows require reselecting a Jira status to populate `statusId`.
