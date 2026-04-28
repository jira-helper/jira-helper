# TASK-70: Gantt Status Mapping Cypress

**Status**: DONE
**Type**: bdd-tests

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить Cypress BDD/component acceptance coverage для Gantt: новая progress mapping настройка сохраняется в localStorage/model flow, а существующий `statusTransition` date mapping работает по status id.

## Файлы

```text
src/features/gantt-chart/IssuePage/features/
├── gantt-status-mapping.feature.cy.tsx  # новый
└── steps/settings.steps.ts              # изменение
```

## BDD Scenarios

- `@SC-PSM-GANTT-1` Configure Gantt status id mapping
- `@SC-PSM-GANTT-2` Gantt status transition mapping matches changelog from and to ids
- `@SC-PSM-GANTT-3` Legacy status transition name is fallback metadata only

## Тесты

| Scenario | Cypress Test |
|---|---|
| `@SC-PSM-GANTT-1` | open Gantt settings, add mapping, select status id `10001`, bucket `Done`, save, assert storage/model and rendered progress bucket |
| `@SC-PSM-GANTT-2` | seed date mappings by id and changelog with duplicate display names, assert bar dates use id `10002` |
| `@SC-PSM-GANTT-3` | seed legacy name-only mapping and assert no false date resolution by `toString` |

## Что сделать

1. Add/extend Gantt Cypress BDD component test file.
2. Reuse existing Gantt feature helpers/steps where possible.
3. Add step support for `statusTransitionId: <id>` separate from legacy `statusTransitionName: <name>`.
4. Keep shared editor mechanics assertions in [TASK-69](./TASK-69-shared-status-mapping-cypress.md) to avoid duplication.

## Критерии приёмки

- [ ] Gantt happy path is covered through settings save and runtime progress effect.
- [ ] Gantt statusTransition id semantics have BDD coverage.
- [ ] Legacy name-only mapping does not create false date matches.
- [ ] Тесты проходят for the new Gantt Cypress spec.

## Зависимости

- Зависит от: [TASK-56](./TASK-56-gantt-date-mapping-id-lookup.md), [TASK-57](./TASK-57-gantt-date-mapping-status-select.md), [TASK-61](./TASK-61-gantt-progress-mapping-runtime.md), [TASK-62](./TASK-62-gantt-progress-mapping-settings-ui.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added Gantt Cypress coverage for saving id-keyed `statusProgressMapping` through settings.
- Added Cypress acceptance checks for `statusTransition` date mappings resolving by changelog status ids.
- Covered legacy name-only transition mappings not resolving by display name.
- Fixed Gantt settings local row handling so incomplete added rows do not disappear before status selection.

**Проблемы и решения**:

Focused Cypress found the new empty row was serialized as an empty mapping and removed before a status could be selected. The modal now keeps incomplete rows local until they contain a valid status id. Combined QA also hit a transient Cypress/Vite optimized-deps reload; focused rerun passed.
