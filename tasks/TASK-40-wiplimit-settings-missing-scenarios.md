# TASK-40: Добавить недостающие Cypress тесты для wiplimit-on-cells SettingsPage

## Описание

Добавить 15 недостающих сценариев в `src/wiplimit-on-cells/SettingsPage/SettingsPage.feature.cy.tsx`.

## Проблема

Валидация показала отсутствующие сценарии:
- SC6: Cannot add range with duplicate name
- SC8: Button shows "Add range" for new name
- SC9: Add cell to existing range
- SC10: Cannot add duplicate cell to range
- SC11: Cannot add range or cell without selecting swimlane
- SC12: Cannot add range or cell without selecting column
- SC13: Edit range name inline
- SC14: Edit WIP limit inline
- SC15: Toggle disable checkbox
- SC19: Clear all settings
- SC20: Save persists to Jira board property
- SC21: Settings load on page open
- SC22: Load settings with legacy "swimline" field
- SC24: Add cell without show badge indicator
- SC25: Show empty table when no ranges configured

## Файл для изменения

`src/wiplimit-on-cells/SettingsPage/SettingsPage.feature.cy.tsx`

## Требования

1. Добавить тесты для всех 15 сценариев
2. Inline editing тесты: focus/blur events
3. Validation тесты: alerts, disabled states
4. Persistence тесты: mock callbacks

## Acceptance Criteria

- [ ] Все 15 сценариев добавлены
- [ ] `node scripts/validate-feature-tests.mjs` проходит для wiplimit-on-cells/SettingsPage
- [ ] Тесты проходят
