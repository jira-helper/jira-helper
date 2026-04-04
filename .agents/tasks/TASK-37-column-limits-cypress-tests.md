# TASK-37: Cypress BDD тесты для column-limits SettingsPage

## Описание

Добавить недостающие Cypress тесты для `src/column-limits/SettingsPage/SettingsPage.feature`.

## Проблема

Валидация показала 6 отсутствующих сценариев в `SettingsPage.feature.cy.tsx`:
- SC1: Cancel button closes the modal without saving
- SC2: Move column from "Without Group" to existing group
- SC3: Move column from one group to another
- SC4: Create new group by dragging column to dropzone
- SC5: Move column back to "Without Group"
- SC6: Dropzone highlights on drag over

## Feature файл

`src/column-limits/SettingsPage/SettingsPage.feature`

## Файл для изменения

`src/column-limits/SettingsPage/SettingsPage.feature.cy.tsx`

## Требования

1. Добавить тесты для всех 6 сценариев
2. Drag-n-drop тесты: использовать Cypress drag events или `cypress-drag-drop` плагин
3. Проверить highlight dropzone через CSS классы

## Acceptance Criteria

- [ ] Все 6 сценариев покрыты тестами
- [ ] `node scripts/validate-feature-tests.mjs` проходит для column-limits
- [ ] Тесты проходят: `npx cypress run --component --spec "src/column-limits/**/*.cy.tsx"`
