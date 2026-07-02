# TASK-69: Shared Status Mapping Cypress

**Status**: DONE
**Type**: bdd-tests

**Parent**: [EPIC-3](./EPIC-3-progress-status-mapping.md)

---

## Описание

Добавить Cypress component coverage для shared editor mechanics: autocomplete, prohibition of arbitrary text, fallback labels, allowed buckets. Это acceptance coverage для UI behavior без feature-specific storage.

## Файлы

```text
src/shared/status-progress-mapping/components/
└── StatusProgressMappingSection.cy.tsx  # новый
```

## BDD Scenarios

- `@SC-PSM-AUTO-1` Select Jira status from autocomplete saves status id
- `@SC-PSM-AUTO-2` Autocomplete does not save arbitrary status text
- `@SC-PSM-AUTO-3` Current label comes from Jira statuses instead of saved fallback name
- `@SC-PSM-AUTO-4` Missing Jira status shows fallback label but matching remains id-only
- `@SC-PSM-DEFAULT-2` Custom mapping offers only three progress buckets
- `@SC-PSM-DEFAULT-3` Blocked remains outside custom status mapping

## Тесты

| Scenario | Cypress Test |
|---|---|
| `@SC-PSM-AUTO-1` | add row, search "Ready", select id `10001`, choose `Done`, assert emitted row |
| `@SC-PSM-AUTO-2` | type missing status, assert no option and no emitted mapping |
| `@SC-PSM-AUTO-3` | mount saved fallback + renamed Jira status, assert current label |
| `@SC-PSM-AUTO-4` | mount missing status, assert fallback label and emitted id-only row |
| `@SC-PSM-DEFAULT-2` / `@SC-PSM-DEFAULT-3` | open bucket select and assert only three allowed options |

## Что сделать

1. Mount controlled `StatusProgressMappingSection` with fixtures.
2. Assert emitted values rather than reaching into feature stores.
3. Cover keyboard/search behavior enough to validate Ant Design Select integration.
4. Keep feature-specific persistence Cypress in separate tasks.

## Критерии приёмки

- [ ] Cypress component tests cover shared editor happy paths and important edges.
- [ ] Tests prove arbitrary text cannot be saved as a status.
- [ ] Tests prove `Blocked` is absent from configurable buckets.
- [ ] Тесты проходят: `npm run cy:run -- --component --spec "src/shared/status-progress-mapping/components/StatusProgressMappingSection.cy.tsx"`.

## Зависимости

- Зависит от: [TASK-58](./TASK-58-status-progress-mapping-section-view.md).

---

## Результаты

**Дата**: TBD

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Added Cypress component coverage for shared `StatusProgressMappingSection`.
- Covered autocomplete id save, arbitrary text rejection, live label priority, missing-status fallback, and allowed bucket options.

**Проблемы и решения**:

Нет.
