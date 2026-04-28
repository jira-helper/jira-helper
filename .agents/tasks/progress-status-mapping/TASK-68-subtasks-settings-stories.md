# TASK-68: Sub-Tasks Settings Stories

**Status**: DONE
**Type**: stories

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Обновить Storybook для финального размещения блока `Status progress mapping` в sub-tasks progress board settings. Временные mockup stories из согласования должны быть удалены или заменены production story состояниями.

## Файлы

```text
src/features/sub-tasks-progress/BoardSettings/
└── BoardSettingsTabContent.stories.tsx  # изменение
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets

## Тесты

- Storybook stories: settings page with empty mapping.
- Storybook stories: settings page with populated mapping.
- Storybook stories: placement after Counting settings and before Task grouping.

## Что сделать

1. Add/update stories for final `BoardSettingsTabContent` placement.
2. Use realistic board property data with `statusProgressMapping`.
3. Remove temporary placement mockup story if it exists.
4. Keep stories focused on presentation, not autosync.

## Критерии приёмки

- [ ] Storybook shows final production placement.
- [ ] Story fixtures use status ids and fallback names.
- [ ] Temporary mockup story no longer appears as production reference.
- [ ] Stories compile.

## Зависимости

- Зависит от: [TASK-67](./TASK-67-subtasks-settings-container.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added final sub-tasks board settings Storybook states for empty status progress mapping.
- Added a populated mapping story using Jira status ids and fallback names.
- Seeded Jira statuses for stories so the shared editor displays current labels in production placement.

**Проблемы и решения**:

Нет.
