# TASK-71: Sub-Tasks Status Mapping Cypress

**Status**: DONE
**Type**: bdd-tests

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить Cypress component acceptance coverage для sub-tasks progress: настройка сохраняется в board property store flow и влияет на runtime progress calculation.

## Файлы

```text
src/features/sub-tasks-progress/BoardSettings/
├── StatusProgressMapping/StatusProgressMappingContainer.cy.tsx  # новый
└── BoardSettingsTabContent.pageObject.ts                        # изменение
```

## BDD Scenarios

- `@SC-PSM-SUB-1` Configure sub-tasks progress status id mapping
- `@SC-PSM-SUB-2` Sub-tasks progress mapping matches by status id, not status name

## Тесты

| Scenario | Cypress Test |
|---|---|
| `@SC-PSM-SUB-1` | open board settings, add mapping, select status id `10001`, bucket `Done`, assert board property contains mapping and progress counts update |
| `@SC-PSM-SUB-2` | seed mapping id `10001`, create subtasks with same/different names, assert id-only matching |

## Что сделать

1. Add Cypress component test for container/store interaction.
2. Extend page object only for status progress mapping controls.
3. Use fixtures with distinct `statusId` and duplicated `statusName`.
4. Keep shared autocomplete/bucket edge coverage in [TASK-69](./TASK-69-shared-status-mapping-cypress.md).

## Критерии приёмки

- [ ] Sub-tasks settings happy path is covered through board property store flow.
- [ ] Runtime calculation effect is asserted for id-only matching.
- [ ] Page object additions stay scoped to the new mapping controls.
- [ ] Тесты проходят for the new sub-tasks Cypress spec.

## Зависимости

- Зависит от: [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md), [TASK-67](./TASK-67-subtasks-settings-container.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added Cypress component coverage for `StatusProgressMappingContainer` store flow.
- Added runtime assertion for id-only sub-tasks progress matching with duplicate/fallback status names.
- Added scoped page object helpers for status progress mapping controls.

**Проблемы и решения**:

Нет.
