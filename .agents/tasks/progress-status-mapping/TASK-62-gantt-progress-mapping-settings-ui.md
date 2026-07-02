# TASK-62: Gantt Progress Mapping Settings UI

**Status**: DONE
**Type**: container

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Встроить shared `StatusProgressMappingSection` в `GanttSettingsModal` на таб `Bars` после `Start of bar` и `End of bar`. Контейнер должен читать Jira statuses через существующий `useGetStatuses()` и писать mapping в draft settings.

## Файлы

```text
src/features/gantt-chart/IssuePage/components/
├── GanttSettingsModal.tsx       # изменение
└── GanttSettingsModal.test.tsx  # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-1` Configure Gantt status id mapping
- `@SC-PSM-AUTO-1` Select Jira status from autocomplete saves status id
- `@SC-PSM-AUTO-2` Autocomplete does not save arbitrary status text
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets

## Тесты

- Component/Vitest: section appears on Bars tab after start/end mappings and before tooltip/colors sections.
- Component/Vitest: selecting status and bucket patches draft as `statusProgressMapping`.
- Component/Vitest: arbitrary search text does not create a persisted mapping row.
- Component/Vitest: localStorage/model save receives id-keyed mapping.

## Что сделать

1. Convert between persisted map and View rows.
2. Pass Jira status options from `useGetStatuses()`.
3. Patch `draft.statusProgressMapping` through existing modal/model save flow.
4. Preserve existing Gantt date mapping form behavior.

## Критерии приёмки

- [ ] Section placement matches requirements.
- [ ] Gantt settings save writes status id mapping to existing localStorage mechanism.
- [ ] UI does not create arbitrary status text rows.
- [ ] Тесты проходят: `npm test -- GanttSettingsModal`.

## Зависимости

- Зависит от: [TASK-58](./TASK-58-status-progress-mapping-section-view.md), [TASK-60](./TASK-60-gantt-progress-mapping-storage.md).
- Блокирует: [TASK-63](./TASK-63-gantt-progress-mapping-stories.md), [TASK-70](./TASK-70-gantt-status-mapping-cypress.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Embedded the shared `StatusProgressMappingSection` into the Gantt Bars tab after start/end mappings and before tooltip fields.
- Added conversion between persisted id-keyed `statusProgressMapping` and editable view rows.
- Wired Jira statuses from `useGetStatuses()` and draft patching through the existing settings form flow.
- Added Vitest coverage for placement, draft patching, and rejecting arbitrary autocomplete search text.

**Проблемы и решения**:

Focused implementation initially kept the section fully controlled by the incoming draft, so two consecutive row edits before a parent rerender could reuse stale rows. The form now keeps local rows synchronized from draft and updates them optimistically on section changes.
