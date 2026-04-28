# TASK-63: Gantt Progress Mapping Stories

**Status**: DONE
**Type**: stories

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Обновить Storybook для финального размещения блока `Status progress mapping` в Gantt settings. Если в коде остались временные mockup stories из согласования, удалить или заменить их production story состоянием.

## Файлы

```text
src/features/gantt-chart/IssuePage/components/
└── GanttSettingsModal.stories.tsx  # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-1` Configure Gantt status id mapping
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets

## Тесты

- Storybook stories: Bars tab with empty mapping.
- Storybook stories: Bars tab with existing mapping row.
- Storybook stories: loading/missing statuses fallback display if feasible in existing story setup.

## Что сделать

1. Add final placement stories for `GanttSettingsModal`.
2. Ensure the section appears after Start/End of bar and before tooltip/color sections.
3. Remove temporary status mapping placement mockup story if it exists.
4. Keep story data local to stories; do not add new production flags.

## Критерии приёмки

- [ ] Storybook показывает production placement, not temporary mockup.
- [ ] Story fixtures use status ids and labels from Jira statuses store mock.
- [ ] Stories compile.

## Зависимости

- Зависит от: [TASK-62](./TASK-62-gantt-progress-mapping-settings-ui.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added final `GanttSettingsModal` Storybook states for empty status progress mapping placement.
- Added a populated mapping story using Jira status ids and labels from the story statuses store.
- Added a missing-status fallback story to show saved `statusName` metadata when a Jira status id is absent.

**Проблемы и решения**:

Нет.
