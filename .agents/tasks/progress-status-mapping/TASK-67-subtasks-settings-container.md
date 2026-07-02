# TASK-67: Sub-Tasks Settings Container

**Status**: DONE
**Type**: container

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить container для `StatusProgressMappingSection` в sub-tasks progress settings и разместить его после `CountSettings` перед `GroupingSettings`. Контейнер подключает board property store actions и `useGetStatuses()`.

## Файлы

```text
src/features/sub-tasks-progress/BoardSettings/
├── BoardSettingsTabContent.tsx                       # изменение
├── BoardSettingsTabContent.test.tsx                  # изменение
└── StatusProgressMapping/StatusProgressMappingContainer.tsx  # новый
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-AUTO-1` Select Jira status from autocomplete saves status id
- `@SC-PSM-AUTO-2` Autocomplete does not save arbitrary status text
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets

## Тесты

- Component/Vitest: mapping section renders after Counting settings and before Task grouping.
- Component/Vitest: selecting status/bucket calls store `setStatusProgressMapping`.
- Component/Vitest: removing a row calls store remove action.
- Component/Vitest: arbitrary text does not create a board property mapping.

## Что сделать

1. Create `StatusProgressMappingContainer` under `BoardSettings`.
2. Convert board property map to rows and rows back to map.
3. Use `useGetStatuses()` for current labels/options.
4. Insert container into `BoardSettingsTabContent` in the approved position.

## Критерии приёмки

- [ ] Sub-tasks settings placement matches requirements.
- [ ] Board property store receives id-keyed mapping.
- [ ] UI uses current Jira status labels with saved fallback only when needed.
- [ ] Тесты проходят: `npm test -- BoardSettingsTabContent`.

## Зависимости

- Зависит от: [TASK-58](./TASK-58-status-progress-mapping-section-view.md), [TASK-65](./TASK-65-subtasks-board-property-store.md).
- Блокирует: [TASK-68](./TASK-68-subtasks-settings-stories.md), [TASK-71](./TASK-71-subtasks-status-mapping-cypress.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Created `StatusProgressMappingContainer` for sub-tasks board settings.
- Wired Jira statuses, board property store mapping actions, and map/row conversion.
- Inserted the container after `CountSettings` and before `GroupingSettings`.
- Added component tests for placement, selecting status/bucket, row removal, and arbitrary text rejection.

**Проблемы и решения**:

Initial focused tests showed incomplete local rows disappeared before a valid status was selected. The container now keeps local rows synchronized with persisted settings and only writes valid id-keyed rows. QA also caught an inline style lint issue, fixed with a CSS module.
