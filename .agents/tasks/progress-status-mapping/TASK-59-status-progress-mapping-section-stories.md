# TASK-59: Status Progress Mapping Section Stories

**Status**: DONE
**Type**: stories

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить Storybook coverage для shared `StatusProgressMappingSection`. Stories должны фиксировать визуальные состояния редактора отдельно от production integration в Gantt и sub-tasks.

## Файлы

```text
src/shared/status-progress-mapping/components/
└── StatusProgressMappingSection.stories.tsx  # новый
```

## BDD Scenarios

- `@SC-PSM-AUTO-1` Select Jira status from autocomplete saves status id
- `@SC-PSM-AUTO-2` Autocomplete does not save arbitrary status text
- `@SC-PSM-AUTO-3` Current label comes from Jira statuses instead of saved fallback name
- `@SC-PSM-AUTO-4` Missing Jira status shows fallback label but matching remains id-only
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets

## Тесты

- Storybook stories: empty state, populated rows, loading statuses, fallback label, duplicate prevention, disabled state.
- No Vitest required in this stories-only TASK.

## Что сделать

1. Создать stories с controlled wrapper for `rows` / `onChange`.
2. Добавить fixtures для loaded statuses, renamed status, missing status.
3. Показать, что bucket list ограничен three buckets.
4. Не добавлять feature-specific storage behavior в shared stories.

## Критерии приёмки

- [ ] Storybook содержит все целевые состояния из testing strategy.
- [ ] Stories используют realistic Jira status ids/names.
- [ ] Stories не зависят от Gantt/sub-tasks stores.
- [ ] Storybook компилируется для нового файла.

## Зависимости

- Зависит от: [TASK-58](./TASK-58-status-progress-mapping-section-view.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added Storybook stories for `StatusProgressMappingSection`.
- Covered default, empty, populated, loading statuses, fallback label, duplicate prevention, and disabled states.
- Used controlled wrapper fixtures with realistic Jira status ids and names.

**Проблемы и решения**:

No blockers. Storybook tests passed.
