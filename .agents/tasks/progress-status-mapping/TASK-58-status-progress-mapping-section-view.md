# TASK-58: Status Progress Mapping Section View

**Status**: DONE
**Type**: view

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Создать shared presentation-компонент для редактирования строк status progress mapping. Компонент отвечает только за UI rows, autocomplete, bucket select и remove/add mechanics; storage и feature-specific side effects остаются в контейнерах.

## Файлы

```text
src/shared/status-progress-mapping/components/
├── StatusProgressMappingSection.tsx       # новый
└── StatusProgressMappingSection.test.tsx  # новый
```

## BDD Scenarios

- `@SC-PSM-AUTO-1` Select Jira status from autocomplete saves status id
- `@SC-PSM-AUTO-2` Autocomplete does not save arbitrary status text
- `@SC-PSM-AUTO-3` Current label comes from Jira statuses instead of saved fallback name
- `@SC-PSM-AUTO-4` Missing Jira status shows fallback label but matching remains id-only
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets
- `@SC-PSM-DEFAULT-3` Blocked remains outside custom status mapping

## Тесты

- Component/Vitest: add row calls `onChange` with an editable empty row shape or selected row according to final implementation.
- Component/Vitest: selected Jira status writes `statusId` and fallback `statusName`.
- Component/Vitest: free text cannot be saved without selecting an option.
- Component/Vitest: current label prefers `statuses` data over saved fallback name.
- Component/Vitest: bucket dropdown includes only three buckets and excludes `Blocked`.

## Что сделать

1. Реализовать `StatusProgressMappingSectionProps` из target-design.
2. Использовать Ant Design `Select` with search, `status.id` as value and current `status.name` as label.
3. Предотвращать duplicate status ids через disabled options или pure row normalization.
4. Не импортировать feature-specific stores/models.

## Критерии приёмки

- [ ] Компонент reusable для Gantt и sub-tasks containers.
- [ ] UI не позволяет сохранить arbitrary status text.
- [ ] Labels берутся из Jira statuses, fallback name используется только когда id не найден/данные не загружены.
- [ ] Тесты проходят: `npm test -- StatusProgressMappingSection`.
- [ ] Нет ошибок линтера для новых файлов.

## Зависимости

- Зависит от: [TASK-53](./TASK-53-status-progress-types.md).
- Блокирует: [TASK-59](./TASK-59-status-progress-mapping-section-stories.md), [TASK-62](./TASK-62-gantt-progress-mapping-settings-ui.md), [TASK-67](./TASK-67-subtasks-settings-container.md), [TASK-69](./TASK-69-shared-status-mapping-cypress.md).

---

## Результаты

**Дата**: 2026-04-28

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Created shared `StatusProgressMappingSection` presentation component.
- Implemented Jira status id selection, fallback label display, duplicate prevention, bucket selection, add/remove row mechanics, and disabled/loading states.
- Added Vitest/RTL coverage for add/select/remove, arbitrary text rejection, current-label preference, missing-status fallback, allowed buckets, and duplicate disabled options.

**Проблемы и решения**:

Fix-loop 1 resolved an ESLint unused variable in the new test file. Review APPROVED and QA PASS.
